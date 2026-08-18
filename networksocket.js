/* ==========================================================
   Hermanos Grill Companion

   networksocket.js

   WebSocket connection to grill-server on Raspberry Pi
   for network-based temperature polling (fallback to BLE)
   ========================================================== */

let networkSocket = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL = 3000; // 3 seconds

function initNetworkSocket(serverAddress) {
    if (!serverAddress) {
        console.warn("Network socket: no server address provided");
        return;
    }

    try {
        const wsUrl = `ws://${serverAddress}:8080`;
        console.log(`Network socket: connecting to ${wsUrl}`);

        networkSocket = new WebSocket(wsUrl);

        networkSocket.onopen = () => {
            console.log("Network socket: connected");
            appState.network.connected = true;
            appState.network.status = "Connected";
            appState.network.error = "";
            appState.network.lastConnectedAt = new Date().toISOString();
            reconnectAttempts = 0;
            saveAppState();
            render();
        };

        networkSocket.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                processNetworkPayload(payload);
            } catch (error) {
                console.error("Network socket: invalid JSON", event.data, error);
                appState.network.error = "Invalid data format";
            }
        };

        networkSocket.onerror = (error) => {
            console.error("Network socket: error", error);
            appState.network.status = "Error";
            appState.network.error = "WebSocket error";
            saveAppState();
            render();
        };

        networkSocket.onclose = () => {
            console.log("Network socket: disconnected");
            appState.network.connected = false;
            appState.network.status = "Disconnected";
            saveAppState();
            render();
            attemptReconnect(serverAddress);
        };

    } catch (error) {
        console.error("Network socket: initialization failed", error);
        appState.network.status = "Failed";
        appState.network.error = error.message;
        saveAppState();
        render();
    }
}

function processNetworkPayload(payload) {
    if (!payload || typeof payload !== "object") {
        throw new Error("Invalid network payload");
    }

    /*
        Expected payload from grill-server:
        {
            "dome": 120,
            "probe1": 72,
            "probe2": 54,
            "battery": 84
        }
    */

    let updated = false;

    // Map dome temperature to Probe 1
    if (payload.dome !== undefined && payload.dome !== null) {
        const probe = appState.probes.find(p => p.id === 1);
        if (probe) {
            const temp = Number(payload.dome);
            if (!Number.isNaN(temp)) {
                probe.temperature = temp;
                probe.lastSeen = Date.now();
                probe.online = true;
                updated = true;
                console.log("Network: Dome temperature", temp, "°C");
            }
        }
    }

    // Map probe1 temperature to Probe 2 (Meat)
    if (payload.probe1 !== undefined && payload.probe1 !== null) {
        const probe = appState.probes.find(p => p.id === 2);
        if (probe) {
            const temp = Number(payload.probe1);
            if (!Number.isNaN(temp)) {
                probe.temperature = temp;
                probe.lastSeen = Date.now();
                probe.online = true;
                updated = true;
                console.log("Network: Probe 1 (Meat) temperature", temp, "°C");
            }
        }
    }

    // Map probe2 temperature to Probe 3
    if (payload.probe2 !== undefined && payload.probe2 !== null) {
        const probe = appState.probes.find(p => p.id === 3);
        if (probe) {
            const temp = Number(payload.probe2);
            if (!Number.isNaN(temp)) {
                probe.temperature = temp;
                probe.lastSeen = Date.now();
                probe.online = true;
                updated = true;
                console.log("Network: Probe 2 temperature", temp, "°C");
            }
        }
    }

    // Update battery status
    if (payload.battery !== undefined && payload.battery !== null) {
        const battery = Number(payload.battery);
        if (!Number.isNaN(battery)) {
            appState.bluetooth.battery = battery;
            updated = true;
            console.log("Network: Battery", battery, "%");
        }
    }

    if (!updated) {
        console.warn("Network socket: no valid temperature values in payload", payload);
        throw new Error("No temperature values found in network payload");
    }

    // Record temperature history
    if (typeof recordTemperatureHistory === "function") {
        recordTemperatureHistory();
    }

    appState.network.lastUpdatedAt = new Date().toISOString();
    appState.network.lastPayload = JSON.stringify(payload);
    saveAppState();
    updateLiveUi();
}

function attemptReconnect(serverAddress) {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log("Network socket: max reconnect attempts reached");
        appState.network.status = "Reconnection failed";
        saveAppState();
        render();
        return;
    }

    reconnectAttempts++;
    console.log(
        `Network socket: reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`
    );

    reconnectTimer = setTimeout(() => {
        initNetworkSocket(serverAddress);
    }, RECONNECT_INTERVAL);
}

function closeNetworkSocket() {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    if (networkSocket) {
        networkSocket.close();
        networkSocket = null;
    }

    appState.network.connected = false;
    appState.network.status = "Disabled";
    appState.network.error = "";
    saveAppState();
    render();
}

function setNetworkSocketEnabled(enabled, serverAddress) {
    if (enabled && serverAddress) {
        appState.network.enabled = true;
        appState.network.serverAddress = serverAddress;
        saveAppState();
        initNetworkSocket(serverAddress);
    } else {
        appState.network.enabled = false;
        saveAppState();
        closeNetworkSocket();
    }
}

// Export functions
window.initNetworkSocket = initNetworkSocket;
window.closeNetworkSocket = closeNetworkSocket;
window.setNetworkSocketEnabled = setNetworkSocketEnabled;
