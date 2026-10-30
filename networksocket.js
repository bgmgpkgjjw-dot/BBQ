/* ==========================================================
   Hermanos Grill Companion

   networksocket.js

   WebSocket connection to grill-server on Raspberry Pi
   for network-based temperature polling (fallback to BLE)
   ========================================================== */

let networkSocket = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
let networkPacketHasReadings = false;
const RECONNECT_BASE_INTERVAL = 2000; // 2 seconds
const RECONNECT_MAX_INTERVAL = 30000; // cap backoff at 30 seconds
const NETWORK_PACKET_STALE_MS = 10000;

// Doubles the wait each attempt (capped), and never permanently gives up -
// a long Wi-Fi/Pi outage during a multi-hour cook should still recover.
function getReconnectDelay() {
    const delay = RECONNECT_BASE_INTERVAL * Math.pow(2, reconnectAttempts);
    return Math.min(delay, RECONNECT_MAX_INTERVAL);
}

function getNetworkHealth() {
    if (typeof isSimulatorActive === "function" && isSimulatorActive()) {
        return "Receiving data";
    }

    if (!appState.network.enabled) {
        return "Disabled";
    }

    if (!appState.network.connected) {
        return appState.network.status || "Disconnected";
    }

    if (!appState.network.lastUpdatedAt) {
        return "Connected, waiting for data";
    }

    const lastPacketTime = Date.parse(appState.network.lastUpdatedAt);
    if (Number.isNaN(lastPacketTime) || Date.now() - lastPacketTime > NETWORK_PACKET_STALE_MS) {
        return "Stale data";
    }

    return "Receiving data";
}

function getNetworkLastPacketText() {
    if (!appState.network.lastUpdatedAt) {
        return "No temperature packet received yet";
    }

    const lastPacketTime = Date.parse(appState.network.lastUpdatedAt);
    if (Number.isNaN(lastPacketTime)) {
        return "Last packet time unavailable";
    }

    return `Last packet: ${new Date(lastPacketTime).toLocaleTimeString()}`;
}

function hasNetworkTemperatureReadings() {
    return networkPacketHasReadings;
}

function initNetworkSocket(serverAddress) {
    if (!serverAddress) {
        console.warn("Network socket: no server address provided");
        return;
    }

    try {
        const token = appState.network?.apiToken;
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${wsProtocol}//${serverAddress}:8080${token ? `?token=${encodeURIComponent(token)}` : ""}`;
        console.log(`Network socket: connecting to ${wsUrl.split("?")[0]}`);

        networkSocket = new WebSocket(wsUrl);

        networkSocket.onopen = () => {
            console.log("Network socket: connected");
            appState.network.connected = true;
            appState.network.status = "Connected";
            appState.network.error = "";
            appState.network.lastConnectedAt = new Date().toISOString();
            appState.network.lastUpdatedAt = null;
            networkPacketHasReadings = false;
            reconnectAttempts = 0;
            saveAppState();
            render();

            // Fill any gap in the active cook's history recorded while this device was disconnected.
            if (typeof backfillActiveSessionFromPi === "function") {
                backfillActiveSessionFromPi();
            }
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

            if (!appState.cook.active) {
                appState.probes.forEach(probe => {
                    probe.temperature = null;
                    probe.online = false;
                });
            }

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
        }
    */

    let updated = false;
    let hasReadings = false;

    // A present key is a reading for that slot. null, 0 and 0xFFFF are "no probe",
    // not a temperature to keep on screen. A missing key is left alone so a dropout
    // sample does not wipe the last good reading.
    for (const [key, probeId] of [["dome", 1], ["probe1", 2], ["probe2", 3]]) {
        if (!Object.prototype.hasOwnProperty.call(payload, key)) {
            continue;
        }

        const probe = appState.probes.find(p => p.id === probeId);
        if (!probe) {
            continue;
        }

        const raw = Number(payload[key]);
        if (payload[key] == null || Number.isNaN(raw) || raw === 0 || raw === 0xFFFF) {
            probe.temperature = null;
            probe.online = false;
            updated = true;
            continue;
        }

        probe.temperature = raw / 10;
        probe.lastSeen = Date.now();
        probe.online = true;
        updated = true;
        hasReadings = true;
    }

    // Other probes are still reporting, but this slot has been missing long enough
    // to be a disconnect rather than a one-packet dropout.
    if (hasReadings) {
        for (const [key, probeId] of [["dome", 1], ["probe1", 2], ["probe2", 3]]) {
            if (Object.prototype.hasOwnProperty.call(payload, key)) {
                continue;
            }

            const probe = appState.probes.find(p => p.id === probeId);
            if (
                probe &&
                probe.temperature != null &&
                Number.isFinite(probe.lastSeen) &&
                Date.now() - probe.lastSeen > NETWORK_PACKET_STALE_MS
            ) {
                probe.temperature = null;
                probe.online = false;
            }
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
    networkPacketHasReadings = hasReadings;
    saveAppState();

    if (typeof checkAlerts === "function") {
        checkAlerts();
    }

    updateLiveUi();
}

function attemptReconnect(serverAddress) {
    const delay = getReconnectDelay();
    reconnectAttempts++;

    console.log(
        `Network socket: reconnect attempt ${reconnectAttempts} in ${delay}ms`
    );

    appState.network.status = `Reconnecting (attempt ${reconnectAttempts})`;
    saveAppState();
    render();

    reconnectTimer = setTimeout(() => {
        initNetworkSocket(serverAddress);
    }, delay);
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
        if (typeof stopSimulator === "function") {
            stopSimulator();
        }
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
window.getNetworkHealth = getNetworkHealth;
window.getNetworkLastPacketText = getNetworkLastPacketText;

setInterval(updateDashboardConnectionStatus, 1000);
