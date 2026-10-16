/* ==========================================================
   Hermanos Grill Companion
   dome.js — dome stability, lid-open detection and overshoot warning

   Pure functions: no DOM / appState access, so they can be unit tested.

   Lid-open: the dome drops lidDropC or more within lidDropWindowMs.
   The event ends when the dome recovers close to its previous level (or
   after lidMaxMs). Samples during an event, plus a short recovery
   period, are ignored for the stability figures.
========================================================== */

const DOME_CONFIG = {
    lookbackMs: 25 * 60 * 1000,
    stabilityWindowMs: 10 * 60 * 1000,
    lidDropC: 15,
    lidDropWindowMs: 90 * 1000,
    lidRecoverC: 5,
    lidMaxMs: 15 * 60 * 1000,
    lidRecoveryGraceMs: 5 * 60 * 1000,
    minStabilitySamples: 4,
    minStabilitySpanMs: 5 * 60 * 1000,
    overshootSlopePerMin: 1.2,
    overshootWindowMs: 3 * 60 * 1000,
    overshootLeadC: 12,
    driftWindowMs: 10 * 60 * 1000
};

function domeSamples(history, now, lookbackMs = DOME_CONFIG.lookbackMs) {
    const result = [];
    for (let i = (history || []).length - 1; i >= 0; i--) {
        const s = history[i];
        if (!s || !Number.isFinite(s.timestamp)) continue;
        if (s.timestamp < now - lookbackMs) break;
        if (s.timestamp <= now && Number.isFinite(s.dome) && s.dome > 0) {
            result.push({ timestamp: s.timestamp, dome: s.dome });
        }
    }
    return result.reverse();
}

// Returns { events: [{start, end, baseline, ongoing}], open }.
function detectLidEvents(samples) {
    const events = [];
    let current = null;

    for (let i = 0; i < samples.length; i++) {
        const s = samples[i];

        if (current) {
            const recovered = s.dome >= current.baseline - DOME_CONFIG.lidRecoverC;
            const expired = s.timestamp - current.start > DOME_CONFIG.lidMaxMs;
            if (recovered || expired) {
                current.end = s.timestamp;
                current.ongoing = false;
                events.push(current);
                current = null;
            }
            continue;
        }

        let peak = s.dome;
        for (let j = i - 1; j >= 0 && s.timestamp - samples[j].timestamp <= DOME_CONFIG.lidDropWindowMs; j--) {
            peak = Math.max(peak, samples[j].dome);
        }

        if (peak - s.dome >= DOME_CONFIG.lidDropC) {
            current = { start: s.timestamp, end: null, baseline: peak, ongoing: true };
        }
    }

    if (current) {
        events.push(current);
    }

    return { events, open: current != null };
}

function isInLidWindow(timestamp, events, now) {
    return events.some(e => {
        const end = (e.end ?? now) + DOME_CONFIG.lidRecoveryGraceMs;
        return timestamp >= e.start && timestamp <= end;
    });
}

function domeSlopePerMin(samples) {
    const n = samples.length;
    if (n < 3) return null;
    const mx = samples.reduce((s, p) => s + p.timestamp, 0) / n;
    const my = samples.reduce((s, p) => s + p.dome, 0) / n;
    let sxx = 0;
    let sxy = 0;
    for (const p of samples) {
        sxx += (p.timestamp - mx) ** 2;
        sxy += (p.timestamp - mx) * (p.dome - my);
    }
    return sxx === 0 ? null : (sxy / sxx) * 60000;
}

function rateDomeSwing(swing) {
    if (swing <= 2) return "Rock steady";
    if (swing <= 5) return "Stable";
    if (swing <= 10) return "Swinging";
    return "Unstable";
}

/*
   Returns {
     lidOpen, lidOpenMs, recovering,
     swing, rating, offset,      // stability over the last 10 min (null if unknown)
     rising, overshootRisk, slopePerMin
   }
*/
function analyzeDome({ history, target = null, now = Date.now() }) {
    const samples = domeSamples(history, now);
    const result = {
        lidOpen: false,
        lidOpenMs: 0,
        recovering: false,
        swing: null,
        rating: null,
        offset: null,
        slopePerMin: null,
        overshootRisk: false
    };

    if (!samples.length) return result;

    const { events, open } = detectLidEvents(samples);
    result.lidOpen = open;

    if (open) {
        result.lidOpenMs = now - events.at(-1).start;
    }

    const last = events.at(-1);
    result.recovering = !open && last != null && now - last.end <= DOME_CONFIG.lidRecoveryGraceMs;

    const clean = samples.filter(s => !isInLidWindow(s.timestamp, events, now));
    const windowed = clean.filter(s => s.timestamp >= now - DOME_CONFIG.stabilityWindowMs);

    if (
        windowed.length >= DOME_CONFIG.minStabilitySamples &&
        windowed.at(-1).timestamp - windowed[0].timestamp >= DOME_CONFIG.minStabilitySpanMs
    ) {
        const temps = windowed.map(s => s.dome);
        const max = Math.max(...temps);
        const min = Math.min(...temps);
        result.swing = (max - min) / 2;
        result.rating = rateDomeSwing(result.swing);

        if (Number.isFinite(target)) {
            const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
            result.offset = mean - target;
        }
    }

    const recent = samples.filter(s => s.timestamp >= now - DOME_CONFIG.overshootWindowMs);
    if (!open && !result.recovering) {
        const slope = domeSlopePerMin(recent);
        result.slopePerMin = slope;

        if (slope != null && Number.isFinite(target)) {
            const current = samples.at(-1).dome;
            // Ceramic keeps heating after the vents are closed, so warn early while still climbing.
            result.overshootRisk =
                slope >= DOME_CONFIG.overshootSlopePerMin &&
                current >= target - DOME_CONFIG.overshootLeadC &&
                current < target + 30;
        }
    }

    return result;
}

// Summary of a whole finished cook, for the history page.
function summarizeDomeSession(history, target) {
    const samples = (history || [])
        .filter(s => s && Number.isFinite(s.timestamp) && Number.isFinite(s.dome) && s.dome > 0);

    if (samples.length < 2) return null;

    const { events } = detectLidEvents(samples);
    const end = samples.at(-1).timestamp;

    let measured = 0;
    let inRange = 0;
    let weighted = 0;

    for (let i = 0; i < samples.length - 1; i++) {
        const s = samples[i];
        const dt = Math.min(samples[i + 1].timestamp - s.timestamp, 5 * 60 * 1000);
        if (isInLidWindow(s.timestamp, events, end)) continue;
        measured += dt;
        weighted += s.dome * dt;
        if (Number.isFinite(target) && Math.abs(s.dome - target) <= 5) inRange += dt;
    }

    if (measured === 0) return null;

    return {
        lidOpens: events.length,
        lidOpenMs: events.reduce((sum, e) => sum + ((e.end ?? end) - e.start), 0),
        meanDome: weighted / measured,
        timeInRangePct: Number.isFinite(target) ? Math.round((inRange / measured) * 100) : null
    };
}

if (typeof window !== "undefined") {
    window.analyzeDome = analyzeDome;
    window.summarizeDomeSession = summarizeDomeSession;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { analyzeDome, summarizeDomeSession, detectLidEvents, DOME_CONFIG };
}
