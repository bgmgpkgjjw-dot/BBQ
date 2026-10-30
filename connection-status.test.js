const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function createApp() {
    const status = { textContent: "", className: "" };
    const timers = [];
    const appState = {
        network: { enabled: true, connected: false, status: "Connecting", lastUpdatedAt: null },
        bluetooth: { connected: false },
        probes: [1, 2, 3].map(id => ({ id, active: false, temperature: null })),
        cook: { active: false }
    };
    let demo = false;
    class FakeWebSocket {
        constructor() { context.socket = this; }
    }
    const context = vm.createContext({
        window: { location: { protocol: "http:" } },
        document: {
            querySelector: selector => selector === "[data-live-status]" ? status : null,
            querySelectorAll: () => []
        },
        appState,
        WebSocket: FakeWebSocket,
        setInterval: fn => timers.push(fn),
        setTimeout() {},
        saveAppState() {},
        render() {},
        isSimulatorActive: () => demo,
        console: { log() {}, warn() {}, error() {} }
    });
    vm.runInContext(fs.readFileSync(require.resolve("./dashboard.js"), "utf8"), context);
    vm.runInContext(fs.readFileSync(require.resolve("./networksocket.js"), "utf8"), context);
    return { context, status, appState, timers, setDemo: value => { demo = value; } };
}

function assertStatus(app, text, className) {
    app.context.updateDashboardConnectionStatus();
    assert.equal(app.status.textContent, text);
    assert.equal(app.status.className, className);
    const html = app.context.dashboardView();
    assert.ok(html.includes(`class="${className}"`));
    assert.ok(html.includes(text));
}

test("dashboard distinguishes Pi connectivity from thermometer readings", () => {
    const app = createApp();
    assertStatus(app, "Pi not connected", "status stale");

    app.context.initNetworkSocket("pi.local");
    app.context.socket.onopen();
    assertStatus(app, "Pi connected · Waiting for thermometer data", "status");

    app.context.processNetworkPayload({ dome: null, probe1: null, probe2: null });
    assert.equal(app.context.getNetworkHealth(), "Receiving data");
    assertStatus(app, "Pi connected · Thermometer not connected or no readings", "status stale");

    app.context.processNetworkPayload({ dome: 1200, probe1: null });
    assertStatus(app, "Pi connected · Live", "status live");
    assert.equal(app.appState.probes[0].temperature, 120);

    app.context.processNetworkPayload({ probe1: 500 });
    assert.equal(app.appState.probes[0].temperature, 120);
    assert.equal(app.appState.probes[1].temperature, 50);

    app.appState.probes[0].lastSeen = Date.now() - 11000;
    app.context.processNetworkPayload({ probe1: 510 });
    assert.equal(app.appState.probes[0].temperature, null);
    assert.equal(app.appState.probes[1].temperature, 51);

    app.context.processNetworkPayload({ dome: 0xFFFF, probe1: 0 });
    assert.equal(app.appState.probes[0].temperature, null);
    assert.equal(app.appState.probes[1].temperature, null);
    assert.equal(app.appState.probes[0].online, false);

    app.context.processNetworkPayload({ dome: null, probe1: null, probe2: null });
    assertStatus(app, "Pi connected · Thermometer not connected or no readings", "status stale");
    assert.equal(app.appState.probes[0].temperature, null);

    app.appState.network.lastUpdatedAt = new Date(Date.now() - 11000).toISOString();
    app.timers.at(-1)();
    assert.equal(app.status.textContent, "Pi connected · No recent data from Pi");
    assertStatus(app, "Pi connected · No recent data from Pi", "status stale");

    app.context.socket.onclose();
    assertStatus(app, "Pi not connected", "status stale");
    app.context.initNetworkSocket("pi.local");
    app.context.socket.onopen();
    assertStatus(app, "Pi connected · Waiting for thermometer data", "status");
});

test("periodic status refresh preserves direct Bluetooth and demo modes", () => {
    const app = createApp();
    app.appState.network.enabled = false;
    assertStatus(app, "Thermometer not connected", "status");

    app.appState.bluetooth.connected = true;
    app.timers.at(-1)();
    assert.equal(app.status.textContent, "Thermometer connected");
    assertStatus(app, "Thermometer connected", "status live");

    app.setDemo(true);
    app.timers.at(-1)();
    assert.equal(app.status.textContent, "Demo mode");
    assertStatus(app, "Demo mode", "status live");
});

test("restoring saved settings never restores a live Pi socket", () => {
    const source = fs.readFileSync(require.resolve("./storage.js"), "utf8");
    const loadFunction = source.slice(source.indexOf("function loadAppState()"), source.indexOf("/* ==========================================================\n   LOAD ON STARTUP"));
    const appState = { network: {}, bluetooth: {} };
    const context = vm.createContext({
        appState,
        APP_STATE_KEY: "app",
        localStorage: {
            getItem: () => JSON.stringify({
                network: { enabled: true, connected: true, status: "Connected", serverAddress: "pi.local" }
            })
        },
        console
    });
    vm.runInContext(loadFunction, context);
    context.loadAppState();
    assert.equal(appState.network.connected, false);
    assert.equal(appState.network.status, "Connecting");
    assert.equal(appState.network.serverAddress, "pi.local");
});
