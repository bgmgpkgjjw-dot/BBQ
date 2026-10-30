const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { ventAdvice, mergeLidEvents, detectLidEvents } = require("./dome");

test("vent advice names the vent to move and leaves them alone while the lid is open", () => {
    const open = ventAdvice({ lidOpen: true }, { target: 110, current: 80 });
    assert.match(open.body, /Leave the bottom vent/);
    assert.match(open.short, /leave the vents/);

    const rising = ventAdvice({ overshootRisk: true }, { target: 110, current: 104 });
    assert.match(rising.body, /bottom vent to a crack/);
    assert.match(rising.body, /110°C/);

    const hot = ventAdvice({ overshootRisk: true }, { target: 110, current: 118 });
    assert.match(hot.body, /shut the top daisy wheel/);

    const low = ventAdvice({ offset: -6 }, { target: 110, current: 108 });
    assert.match(low.body, /pencil width/);
    assert.match(low.body, /top daisy wheel/);

    assert.equal(ventAdvice({ offset: 1, swing: 2 }, { target: 110, current: 111 }), null);
});

test("a detected lid opening is kept once and does not wipe the reason", () => {
    const first = mergeLidEvents([], [{ start: 1_000 }]);
    assert.equal(first.changed, true);
    first.events[0].reason = "Checked the bark";

    const again = mergeLidEvents(first.events, [{ start: 20_000 }]);
    assert.equal(again.changed, false);
    assert.equal(again.events[0].reason, "Checked the bark");

    const later = mergeLidEvents(again.events, [{ start: 120_000 }]);
    assert.equal(later.events.length, 2);
});

test("lid detection produces a marker the chart can place", () => {
    const samples = [];
    for (let i = 0; i < 10; i++) {
        samples.push({ timestamp: i * 30_000, dome: i === 4 ? 90 : 120 });
    }
    const { events } = detectLidEvents(samples);
    assert.equal(events.length, 1);
    assert.equal(events[0].start, 4 * 30_000);
});

function loadHistoryHelpers() {
    const context = vm.createContext({
        console,
        document: { addEventListener() {}, querySelectorAll: () => [] },
        setTimeout() {},
        clearTimeout() {}
    });
    vm.runInContext(fs.readFileSync(require.resolve("./units.js"), "utf8"), context);
    vm.runInContext(fs.readFileSync(require.resolve("./history.js"), "utf8"), context);
    return context;
}

test("a shared cook leaves out the private journal", () => {
    const history = loadHistoryHelpers();
    const text = history.shareCookText({
        name: "Pork shoulder",
        startedAt: "2026-10-12T10:00:00.000Z",
        duration: "9h 40m",
        rating: 5,
        notes: "SECRET-NOTES",
        improve: "SECRET-NEXT-TIME",
        temperatureHistory: [
            { timestamp: 1, dome: 120, meat: 70 },
            { timestamp: 2, dome: 132, meat: 94 }
        ]
    });

    assert.match(text, /Pork shoulder/);
    assert.match(text, /9h 40m/);
    assert.match(text, /Dome peak 132°C/);
    assert.match(text, /Core peak 94°C/);
    assert.equal(text.includes("SECRET-NOTES"), false);
    assert.equal(text.includes("SECRET-NEXT-TIME"), false);
});

test("cooking like last time copies the plan, not the journal", () => {
    const history = loadHistoryHelpers();
    const settings = history.settingsFromCook({
        id: "last",
        name: "Brisket",
        recipe: "brisket",
        domeTarget: 150,
        meatTarget: 94,
        phases: [
            { name: "Smoke", domeTarget: 120, meatTarget: 70 },
            { name: "Wrap", domeTarget: 130, meatTarget: 94 }
        ],
        notes: "SECRET-NOTES",
        improve: "SECRET-NEXT-TIME",
        photos: ["photo-1"],
        temperatureHistory: [{ timestamp: 1, dome: 120, meat: 40 }]
    });

    assert.equal(settings.name, "Brisket");
    assert.equal(settings.domeTarget, 120);
    assert.equal(settings.meatTarget, 70);
    assert.equal(settings.phases.length, 2);
    assert.equal(settings.likeSessionId, "last");
    assert.equal(settings.notes, undefined);
    assert.equal(settings.photos, undefined);
    assert.equal(settings.temperatureHistory, undefined);
});

test("temperatures follow the chosen unit, stored values stay in Celsius", () => {
    const context = vm.createContext({ console, appState: { settings: { temperatureUnit: "F" } } });
    vm.runInContext(fs.readFileSync(require.resolve("./units.js"), "utf8"), context);

    assert.equal(context.formatTemp(100), "212°F");
    assert.equal(context.formatTempDelta(5, 1), "9.0°");
    assert.equal(context.targetInputValue(93.3333), "200");
    assert.ok(Math.abs(context.displayToCelsius("203") - 95) < 1e-9);
    assert.equal(context.localizeTemperatureText("Stabilize at 120°C or 110-130°C"), "Stabilize at 248°F or 230-266°F");

    context.appState.settings.temperatureUnit = "C";
    assert.equal(context.formatTemp(100), "100°C");
    assert.equal(context.displayToCelsius("95"), 95);
    assert.equal(context.displayToCelsius(""), null);
    assert.equal(context.localizeTemperatureText("120°C"), "120°C");
});
