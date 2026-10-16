/* ==========================================================
   Hermanos Grill Companion
   simulator.js

    Demo mode: feeds a fake cook (dome warm-up, meat rise with a
    stall) through the same path as real grill-server data, so the
    app can be tried without any hardware.
   ========================================================== */

const SIMULATOR_TICK_MS = 2000;
const SIMULATOR_DOME_TARGET = 110;
const SIMULATOR_AMBIENT = 20;

let simulatorTimer = null;
let simulatorState = null;

function isSimulatorActive() {
    return simulatorTimer !== null;
}

function simulatorNoise(amplitude) {
    return (Math.random() - 0.5) * 2 * amplitude;
}

function simulatorTick() {
    const sim = simulatorState;

    // Dome warms up over ~1 minute, then hovers around the target.
    sim.dome += (SIMULATOR_DOME_TARGET - sim.dome) * 0.08;
    const dome = sim.dome + simulatorNoise(0.6);

    // Meat rises steadily and slows through a stall at 65-72 C like a real brisket.
    const inStall = sim.meat > 65 && sim.meat < 72;
    sim.meat += inStall ? 0.04 : 0.35;
    sim.meat = Math.min(sim.meat, 96);
    const meat = sim.meat + simulatorNoise(0.1);

    try {
        processNetworkPayload({
            dome: Math.round(dome * 10),
            probe1: Math.round(meat * 10)
        });
    } catch (error) {
        console.error("Simulator: payload rejected", error);
    }
}

function startSimulator() {
    if (isSimulatorActive()) {
        return;
    }

    // Demo data must not mix with a real connection.
    if (appState.network.enabled) {
        setNetworkSocketEnabled(false);
    }

    simulatorState = { dome: SIMULATOR_AMBIENT, meat: SIMULATOR_AMBIENT };
    appState.settings.simulator = true;
    saveAppState();

    simulatorTimer = setInterval(simulatorTick, SIMULATOR_TICK_MS);
    simulatorTick();
    render();
}

function stopSimulator() {
    if (!isSimulatorActive()) {
        return;
    }

    clearInterval(simulatorTimer);
    simulatorTimer = null;
    simulatorState = null;
    appState.settings.simulator = false;

    if (!appState.cook.active) {
        appState.probes.forEach(probe => {
            probe.temperature = null;
            probe.online = false;
        });
    }

    saveAppState();
    render();
}

function setSimulatorEnabled(enabled) {
    if (enabled) {
        startSimulator();
    } else {
        stopSimulator();
    }
}

window.startSimulator = startSimulator;
window.stopSimulator = stopSimulator;
window.setSimulatorEnabled = setSimulatorEnabled;
window.isSimulatorActive = isSimulatorActive;

// Resume demo mode after a reload.
if (appState.settings.simulator) {
    window.addEventListener("load", startSimulator);
}
