const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("service worker precaches every local script the page loads", () => {
    const html = fs.readFileSync(require.resolve("./index.html"), "utf8");
    const sw = fs.readFileSync(require.resolve("./sw.js"), "utf8");
    const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)]
        .map(match => match[1])
        .filter(src => !src.includes("://"));

    assert.ok(scripts.length > 10);
    for (const src of scripts) {
        assert.ok(sw.includes(`'./${src}'`), `missing ${src}`);
    }
    assert.match(sw, /bbq-pwa-v26/);
});

test("history chart rebuilds when the canvas or target changed", () => {
    const source = fs.readFileSync(require.resolve("./history.js"), "utf8");
    const context = vm.createContext({
        console,
        document: { addEventListener() {}, querySelectorAll: () => [] },
        setTimeout() {},
        clearTimeout() {}
    });
    vm.runInContext(source, context);
    const canvas = {};
    const session = { id: "s1", domeTarget: 110, meatTarget: 75 };
    const chart = {
        canvas,
        _bbqSessionId: "s1",
        _bbqSampleCount: 4,
        _bbqDomeTarget: 110,
        _bbqMeatTarget: 75
    };

    assert.equal(context.historyChartIsCurrent(chart, canvas, session, 4), true);
    assert.equal(context.historyChartIsCurrent(chart, {}, session, 4), false);
    session.domeTarget = 130;
    assert.equal(context.historyChartIsCurrent(chart, canvas, session, 4), false);
});

test("open history follows the live session after a sync replacement", () => {
    const source = fs.readFileSync(require.resolve("./history.js"), "utf8");
    const live = { id: "s1", domeTarget: 140, meatTarget: 90 };
    const stale = { id: "s1", domeTarget: 110, meatTarget: 70 };
    const context = vm.createContext({
        console,
        document: { addEventListener() {}, querySelectorAll: () => [] },
        setTimeout() {},
        clearTimeout() {},
        appState: { selectedHistory: stale, sessions: [live] }
    });
    vm.runInContext(source, context);
    assert.equal(context.getOpenHistorySession(), live);
    assert.equal(context.appState.selectedHistory, live);
});
