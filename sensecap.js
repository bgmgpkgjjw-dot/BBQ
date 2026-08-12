/* ==========================================================
   Hermanos Grill Companion

   sensecap.js

   Wi-Fi data ingestion for Sensecap M1 integration.
   This module is scaffolded to receive telemetry from a Sensecap
   endpoint and map it into local probe state.
   ========================================================== */

let sensecapPollingTimer = null;

function setSensecapEndpoint(value) {
    appState.sensecap.endpoint = value.trim();
    saveAppState();
    render();
}

function setSensecapPollingInterval(value) {
    const interval = Number(value);
    if (Number.isNaN(interval) || interval < 5) {
        return;
    }

    appState.sensecap.pollingIntervalSeconds = interval;
    saveAppState();
    if (appState.sensecap.enabled) {
        restartSensecapPolling();
    }
}

function setSensecapEnabled(enabled) {
    appState.sensecap.enabled = Boolean(enabled);
    appState.sensecap.status = enabled ? "Starting..." : "Disabled";
    appState.sensecap.error = "";
    saveAppState();
    render();

    if (enabled) {
        restartSensecapPolling();
    } else {
        stopSensecapPolling();
    }
}

function restartSensecapPolling() {
    stopSensecapPolling();

    if (!appState.sensecap.enabled) {
        appState.sensecap.status = "Disabled";
        saveAppState();
        render();
        return;
    }

    if (!appState.sensecap.endpoint) {
        appState.sensecap.status = "No endpoint";
        saveAppState();
        render();
        return;
    }

    fetchSensecapData();
    sensecapPollingTimer = setInterval(
        fetchSensecapData,
        appState.sensecap.pollingIntervalSeconds * 1000
    );
}

function stopSensecapPolling() {
    if (sensecapPollingTimer) {
        clearInterval(sensecapPollingTimer);
        sensecapPollingTimer = null;
    }
}

async function fetchSensecapData() {
    try {
        if (!appState.sensecap.endpoint) {
            throw new Error("Sensecap endpoint is not configured.");
        }

        appState.sensecap.status = "Fetching...";
        render();

        const response = await fetch(appState.sensecap.endpoint, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Sensecap request failed: ${response.status}`);
        }

        const payload = await response.json();
        processSensecapPayload(payload);

        appState.sensecap.status = "Connected";
        appState.sensecap.lastUpdatedAt = new Date().toISOString();
        appState.sensecap.error = "";
        saveAppState();
        render();
    }
    catch (error) {
        console.error("Sensecap error:", error);
        appState.sensecap.status = "Error";
        appState.sensecap.error = error?.message || "Unknown error";
        saveAppState();
        render();
    }
}

function processSensecapPayload(payload) {
    if (!payload || typeof payload !== "object") {
        throw new Error("Invalid Sensecap payload");
    }

    // Example payload shape expected from Sensecap M1:
    // {
    //   "deviceId": "...",
    //   "measurements": [
    //     { "sensorId": "probe-1", "temperature": 92.4 },
    //     { "sensorId": "probe-2", "temperature": 104.1 }
    //   ]
    // }

    const mapping = appState.sensecap.sensorMapping || {};
    let updated = false;

    if (Array.isArray(payload.measurements)) {
        payload.measurements.forEach(measurement => {
            if (!measurement || typeof measurement !== "object") return;
            const value = Number(measurement.temperature);
            if (Number.isNaN(value)) return;

            const sensorKey = measurement.sensorId || measurement.id;
            const target = mapping[sensorKey];
            if (!target) return;

            const probe = appState.probes.find(p => p.id === Number(target) || p.type === target);
            if (!probe) return;

            probe.temperature = value;
            updated = true;
        });
    }

    if (!updated) {
        for (const [sensorKey, target] of Object.entries(mapping)) {
            const value = getNestedValue(payload, sensorKey);
            if (value == null) continue;

            const temperature = Number(value);
            if (Number.isNaN(temperature)) continue;

            const probe = appState.probes.find(p => p.id === Number(target) || p.type === target);
            if (!probe) continue;

            probe.temperature = temperature;
            updated = true;
        }
    }

    if (!updated) {
        throw new Error("No mapped Sensecap temperature values were found.");
    }

    updateLiveUi();
}

function getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    return path.split(".").reduce((current, key) => {
        return current && typeof current === "object" ? current[key] : undefined;
    }, obj);
}

window.setSensecapEndpoint = setSensecapEndpoint;
window.setSensecapPollingInterval = setSensecapPollingInterval;
window.setSensecapEnabled = setSensecapEnabled;

if (appState.sensecap.enabled) {
    restartSensecapPolling();
}
