const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { estimateCoreForecast, estimateCarryover, CARRYOVER_CONFIG, FORECAST_CONFIG } = require("./forecast");

const minute = 60 * 1000;
const now = 60 * minute;

function historyFor({ drift = 0, dome = 120, meat = i => 35 + i * 0.1 } = {}) {
    return Array.from({ length: 31 }, (_, i) => ({
        timestamp: now - (30 - i) * minute,
        meat: meat(i),
        dome: dome == null ? null : dome + drift * (i / 30 - 0.5)
    }));
}

function forecast(history, options = {}) {
    return estimateCoreForecast({
        history,
        meatTemp: history.at(-1)?.meat,
        target: 75,
        now,
        cookStartedAt: 1,
        ...options
    });
}

test("small dome drift does not masquerade as meat heating", () => {
    const results = [-2, 0, 2].map(drift => forecast(historyFor({ drift })));
    assert.ok(results.every(result => result.state === "estimate"));
    const minutes = results.map(result => result.etaMs / minute);
    assert.ok(Math.max(...minutes) - Math.min(...minutes) < 10, `${minutes}`);
});

test("constant-dome Newton heating predicts the known target time", () => {
    const dome = 120;
    const k = 0.004;
    const history = historyFor({ dome, meat: i => dome - 100 * Math.exp(-k * i) });
    const result = forecast(history, { target: 75 });
    const expectedMinutes = Math.log((dome - history.at(-1).meat) / (dome - 75)) / k;
    assert.equal(result.state, "estimate");
    assert.ok(Math.abs(result.etaMs / minute - expectedMinutes) < 0.01);
});

test("missing dome readings fall back to the meat trend", () => {
    const result = forecast(historyFor({ dome: null }));
    assert.equal(result.state, "estimate");
    assert.ok(Math.abs(result.etaMs / minute - 370) < 0.01);
});

test("missing or nonpositive current values do not claim target reached", () => {
    const history = historyFor();
    for (const options of [{ meatTemp: 0 }, { meatTemp: null }, { target: 0 }, { target: null }]) {
        assert.equal(forecast(history, options).state, "waiting");
    }
});

test("old history does not produce a live estimate", () => {
    const history = historyFor().map(sample => ({
        ...sample,
        timestamp: sample.timestamp - FORECAST_CONFIG.maxSampleAgeMs - 1
    }));
    assert.equal(forecast(history).state, "waiting");
});

test("a rising core with an ETA beyond 24 hours is not called flat", () => {
    const result = forecast(historyFor({ dome: null, meat: i => 30 + i * 0.03 }), { target: 100 });
    assert.equal(result.state, "too-long");
    assert.ok(result.slopePerHour > 0);
});

test("target reached and stall behavior remain available", () => {
    const history = historyFor({ meat: i => 65 + i * 0.02 });
    assert.equal(forecast(history, { meatTemp: 75 }).state, "reached");
    assert.equal(forecast(history).state, "stalled");
});

test("dashboard suppresses forecasts when the meat probe is missing or stale", () => {
    const probe = { type: "meat", temperature: 38, lastSeen: Date.now() };
    const context = vm.createContext({
        window: {},
        setInterval() {},
        appState: { cook: { active: true, meatTarget: 75 }, probes: [probe] },
        getCurrentSession: () => ({ temperatureHistory: historyFor() }),
        estimateCoreForecast,
        formatForecastDuration() {}
    });
    vm.runInContext(fs.readFileSync(require.resolve("./dashboard.js"), "utf8"), context);
    assert.notEqual(context.getMeatForecast().state, "unavailable");
    probe.lastSeen = Date.now() - 10001;
    assert.equal(context.getMeatForecast().state, "unavailable");
    assert.match(context.renderForecastHtml(context.getMeatForecast()), /Waiting for meat probe/);
    probe.lastSeen = Date.now();
    probe.temperature = null;
    assert.equal(context.getMeatForecast().state, "unavailable");
    assert.match(context.renderForecastHtml({ state: "too-long" }), /exceeds 24 hours/);
});

test("carryover follows the recent slope and is capped", () => {
    const steady = historyFor({ meat: i => 60 + i * 0.3 });
    const result = estimateCarryover({ history: steady, meatTemp: steady.at(-1).meat, now });
    assert.ok(Math.abs(result.deltaC - 3) < 0.3);
    assert.ok(Math.abs(result.peakC - (steady.at(-1).meat + result.deltaC)) < 1e-9);

    const fast = historyFor({ meat: i => 30 + i * 2 });
    assert.equal(estimateCarryover({ history: fast, meatTemp: fast.at(-1).meat, now }).deltaC, CARRYOVER_CONFIG.maxDeltaC);
});

test("carryover is zero when the core is flat and unknown without data", () => {
    const flat = historyFor({ meat: () => 70 });
    assert.equal(estimateCarryover({ history: flat, meatTemp: 70, now }).deltaC, 0);
    assert.equal(estimateCarryover({ history: [], meatTemp: 70, now }), null);
});
