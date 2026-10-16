/* ==========================================================
   Hermanos Grill Companion
   forecast.js — core-temperature ETA and stall detection

   Pure functions: no DOM / appState access, so they can be unit tested.

   Model: the meat warms towards the dome temperature (Newton's law of
   heating): dT/dt = k * (dome - T). k is fitted on a recent window, then
   solved for the time to reach the target. This captures the natural
   slow-down as the core nears the dome temperature, which a plain linear
   extrapolation would miss (it would be too optimistic at the end of a cook).
   When the dome is too close to the target for that to be meaningful, it
   falls back to a linear extrapolation.
========================================================== */

const FORECAST_CONFIG = {
    windowMs: 30 * 60 * 1000,
    shortWindowMs: 10 * 60 * 1000,
    minSpanMs: 8 * 60 * 1000,
    minSamples: 6,
    minSlopePerMin: 0.02,
    stallMinTemp: 60,
    stallMaxTemp: 85,
    stallSlopePerMin: 0.1,
    stallMinElapsedMs: 45 * 60 * 1000,
    maxEtaMs: 24 * 60 * 60 * 1000,
    minDomeMargin: 5
};

function forecastRegression(points) {
    const n = points.length;
    if (n < 2) return null;

    const meanX = points.reduce((s, p) => s + p.x, 0) / n;
    const meanY = points.reduce((s, p) => s + p.y, 0) / n;
    let sxx = 0;
    let sxy = 0;
    let syy = 0;

    for (const p of points) {
        sxx += (p.x - meanX) ** 2;
        sxy += (p.x - meanX) * (p.y - meanY);
        syy += (p.y - meanY) ** 2;
    }

    if (sxx === 0) return null;

    const slope = sxy / sxx;
    const r2 = syy === 0 ? 0 : (sxy * sxy) / (sxx * syy);
    return { slope, r2 };
}

function forecastValidSamples(history, now) {
    return (history || [])
        .filter(s => s && Number.isFinite(s.timestamp) && Number.isFinite(s.meat) && s.meat > 0)
        .filter(s => s.timestamp <= now)
        .sort((a, b) => a.timestamp - b.timestamp);
}

// Slope in °C per minute over the last windowMs, or null when there is not enough data.
function forecastSlope(samples, now, windowMs) {
    const windowed = samples.filter(s => s.timestamp >= now - windowMs);
    if (windowed.length < 3) return null;

    const span = windowed.at(-1).timestamp - windowed[0].timestamp;
    if (span < windowMs * 0.4) return null;

    const fit = forecastRegression(
        windowed.map(s => ({ x: s.timestamp / 60000, y: s.meat }))
    );
    return fit ? { ...fit, count: windowed.length, spanMs: span } : null;
}

function forecastDomeReference(samples, now) {
    const recent = samples
        .filter(s => s.timestamp >= now - FORECAST_CONFIG.shortWindowMs && Number.isFinite(s.dome) && s.dome > 0)
        .map(s => s.dome);
    if (!recent.length) return null;
    return recent.reduce((a, b) => a + b, 0) / recent.length;
}

function forecastNewtonMinutes(samples, now, target, meatNow, domeRef) {
    if (domeRef == null || domeRef - target < FORECAST_CONFIG.minDomeMargin) return null;

    const windowed = samples.filter(s => s.timestamp >= now - FORECAST_CONFIG.windowMs && Number.isFinite(s.dome));
    if (windowed.length < FORECAST_CONFIG.minSamples) return null;

    // ln(dome - T) is linear in time with slope -k.
    const points = windowed
        .filter(s => s.dome - s.meat > 1)
        .map(s => ({ x: s.timestamp / 60000, y: Math.log(s.dome - s.meat) }));
    const fit = forecastRegression(points);
    if (!fit || fit.slope >= 0) return null;

    const k = -fit.slope;
    const gap = domeRef - meatNow;
    if (gap <= 1) return null;

    return Math.log(gap / (domeRef - target)) / k;
}

function formatForecastDuration(ms) {
    const totalMinutes = Math.max(1, Math.round(ms / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes} min`;
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/*
   Returns { state, etaMs, finishAt, stalled, confidence, slopePerHour }.
   state: "waiting" | "reached" | "stalled" | "flat" | "estimate"
*/
function estimateCoreForecast({ history, meatTemp, target, now = Date.now(), cookStartedAt = null }) {
    const result = {
        state: "waiting",
        etaMs: null,
        finishAt: null,
        stalled: false,
        confidence: null,
        slopePerHour: null
    };

    if (!Number.isFinite(meatTemp) || !Number.isFinite(target)) return result;

    if (meatTemp >= target) {
        return { ...result, state: "reached" };
    }

    const samples = forecastValidSamples(history, now);
    const long = forecastSlope(samples, now, FORECAST_CONFIG.windowMs);

    if (!long || long.count < FORECAST_CONFIG.minSamples || long.spanMs < FORECAST_CONFIG.minSpanMs) {
        return result;
    }

    const short = forecastSlope(samples, now, FORECAST_CONFIG.shortWindowMs);
    const slope = long.slope;
    result.slopePerHour = slope * 60;

    const cookElapsed = cookStartedAt ? now - cookStartedAt : Infinity;
    const stalled =
        meatTemp >= FORECAST_CONFIG.stallMinTemp &&
        meatTemp <= FORECAST_CONFIG.stallMaxTemp &&
        cookElapsed >= FORECAST_CONFIG.stallMinElapsedMs &&
        slope < FORECAST_CONFIG.stallSlopePerMin &&
        (!short || short.slope < FORECAST_CONFIG.stallSlopePerMin * 1.5);

    if (stalled) {
        return { ...result, state: "stalled", stalled: true };
    }

    if (slope < FORECAST_CONFIG.minSlopePerMin) {
        return { ...result, state: "flat" };
    }

    const remaining = target - meatTemp;
    const domeRef = forecastDomeReference(samples, now);
    const newtonMinutes = forecastNewtonMinutes(samples, now, target, meatTemp, domeRef);
    const linearMinutes = remaining / slope;

    const minutes = newtonMinutes != null && Number.isFinite(newtonMinutes) && newtonMinutes > 0
        ? newtonMinutes
        : linearMinutes;

    const etaMs = minutes * 60000;
    if (!Number.isFinite(etaMs) || etaMs <= 0 || etaMs > FORECAST_CONFIG.maxEtaMs) {
        return { ...result, state: "flat" };
    }

    const steady = long.r2 >= 0.9 && long.spanMs >= 20 * 60 * 1000;
    const approximate = long.r2 >= 0.7;

    return {
        ...result,
        state: "estimate",
        etaMs,
        finishAt: now + etaMs,
        confidence: steady ? "good" : approximate ? "fair" : "rough"
    };
}

if (typeof window !== "undefined") {
    window.estimateCoreForecast = estimateCoreForecast;
    window.formatForecastDuration = formatForecastDuration;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { estimateCoreForecast, formatForecastDuration, FORECAST_CONFIG };
}
