/* ==========================================================
   Hermanos Grill Companion
   settings.js

   Instellingen scherm: probe beheer (tot 6 probes) + app instellingen
   ========================================================== */


// Startwaarde voor een sonde die net actief wordt en nog geen meting heeft
// We tonen geen valse waarden meer; de UI blijft neutral tot er een echte meting binnenkomt.
function defaultStartTemperature(type) {

    return null;

}


function toggleProbeActive(id) {

    const probe = appState.probes.find(p => p.id === id);

    if (!probe) return;


    probe.active = !probe.active;


    // Bij activeren zonder rol: standaard op "vlees" zetten
    if (probe.active && probe.type === "unused") {

        probe.type = "meat";

    }


    // Zorg dat een net actieve sonde direct een zinnige waarde heeft
    if (probe.active && probe.temperature === null) {

        probe.temperature = defaultStartTemperature(probe.type);

    }


    render();

}


function setProbeType(id, type) {

    const probe = appState.probes.find(p => p.id === id);

    if (!probe) return;


    probe.type = type;


    if (probe.active && probe.temperature === null) {

        probe.temperature = defaultStartTemperature(type);

    }


    render();

}


function setProbeName(id, name) {

    const probe = appState.probes.find(p => p.id === id);

    if (!probe) return;


    probe.name = name;

    // geen render() hier: anders springt de cursor in het tekstveld weg
    // tijdens het typen. De naam staat al bij de volgende render goed.

}


function setBluetoothStatus(status, error = "") {

    appState.bluetooth.status = status;
    appState.bluetooth.error = error;

    render();

}

function applyTheme(presetKey = appState.theme?.preset || "default") {

    const preset = THEME_PRESETS[presetKey] || THEME_PRESETS.default;

    appState.theme = {
        ...appState.theme,
        ...preset,
        preset: presetKey
    };

    const root = document.documentElement;

    if (root) {
        root.style.setProperty("--accent", preset.accent);
        root.style.setProperty("--accent-light", preset.accentLight);
        root.style.setProperty("--gradient-button", `linear-gradient(135deg, ${preset.buttonStart}, ${preset.buttonEnd})`);
        root.style.setProperty("--gradient-progress", `linear-gradient(90deg, ${preset.progressStart}, ${preset.progressEnd})`);
    }

    if (typeof saveAppState === "function") {
        saveAppState();
    }
}

function setTheme(presetKey) {
    if (!presetKey || !THEME_PRESETS[presetKey]) {
        return;
    }

    applyTheme(presetKey);
    render();
}


function parseTemperaturePayload(payload) {

    if (!payload) return null;

    const values = payload.split(/[^0-9.-]+/).filter(Boolean);

    if (values.length >= 1) {
        const temp = Number(values[0]);
        if (Number.isFinite(temp)) return temp;
    }

    return null;

}


function applyTemperatureReading(rawValue) {

    const temperature = parseTemperaturePayload(rawValue);

    if (temperature === null) return;

    const domeProbe = appState.probes.find(p => p.active && p.type === "dome");
    const meatProbe = appState.probes.find(p => p.active && p.type === "meat");

    if (domeProbe) {
        domeProbe.temperature = temperature;
    }

    if (meatProbe) {
        meatProbe.temperature = temperature;
    }

    appState.bluetooth.lastPayload = rawValue;
    appState.bluetooth.lastUpdatedAt = new Date().toISOString();

    updateLiveUi();

}


function connectBluetoothDevice() {

    setBluetoothStatus("Requesting device...");

    if (!navigator.bluetooth || !navigator.bluetooth.requestDevice) {
        setBluetoothStatus("Not supported", "Web Bluetooth is not available in this browser.");
        return;
    }

    connectBluetooth().catch(err => {
        appState.bluetooth.connected = false;
        appState.bluetooth.device = null;
        appState.bluetooth.deviceRef = null;
        appState.bluetooth.battery = null;
        appState.bluetooth.error = err?.message || "Bluetooth connection failed.";
        appState.bluetooth.status = "Connection failed";
        render();
    });

}


function disconnectBluetoothDevice() {

    if (appState.bluetooth.deviceRef?.gatt?.connected) {

        appState.bluetooth.deviceRef.gatt.disconnect();

    }

    appState.bluetooth.connected = false;
    appState.bluetooth.device = null;
    appState.bluetooth.deviceRef = null;
    appState.bluetooth.battery = null;
    appState.bluetooth.status = "Disconnected";
    appState.bluetooth.error = "";

    render();

}


function settingsView() {

    return `

    <div class="card">

        <h2>

            Probes

        </h2>

        <p style="color:var(--muted); font-size:13px; margin-bottom:14px">

            Up to 6 probes. Enable a probe and assign its role
            (dome / meat / ambient). Inactive probes are hidden from the dashboard.

        </p>

        ${appState.probes.map(p => `

                <div class="probe-settings-row">

                    <input
                        type="text"
                        class="probe-name-input"
                        value="${p.name}"
                        oninput="setProbeName(${p.id}, this.value)"
                        ${p.active ? "" : "disabled"}
                    >

                    <select
                        class="probe-type-select"
                        onchange="setProbeType(${p.id}, this.value)"
                        ${p.active ? "" : "disabled"}
                    >
                        <option value="dome" ${p.type === "dome" ? "selected" : ""}>Dome</option>
                        <option value="meat" ${p.type === "meat" ? "selected" : ""}>Vlees</option>
                        <option value="ambient" ${p.type === "ambient" ? "selected" : ""}>Ambient</option>
                    </select>

                    <button
                        class="probe-toggle ${p.active ? "on" : ""}"
                        onclick="toggleProbeActive(${p.id})"
                    >
                        ${p.active ? "" : ""}
                    </button>

                </div>

            `).join("")

        }

    </div>


    <div class="card">

        <h2>

            Bluetooth

        </h2>

        <p style="color:var(--muted); font-size:13px; margin-bottom:12px">

            Connect to a device through Web Bluetooth in Bluefy. This is the first step for thermometer connectivity.

        </p>

        <div class="bluetooth-status">
            Status: ${appState.bluetooth.status}
        </div>

        <div class="bluetooth-meta">
            Device: ${appState.bluetooth.device || "No device selected"}
        </div>

        ${appState.bluetooth.battery !== null ? `<div class="bluetooth-meta">Battery: ${appState.bluetooth.battery}%</div>` : ""}

        ${appState.bluetooth.error ? `<p class="bluetooth-error">${appState.bluetooth.error}</p>` : ""}

        <div class="button-row">
            <button class="button" onclick="connectBluetoothDevice()">
                ${appState.bluetooth.connected ? "Reconnect" : "Connect"}
            </button>

            <button class="button secondary" onclick="disconnectBluetoothDevice()" ${appState.bluetooth.connected ? "" : "disabled"}>
                Disconnect
            </button>
        </div>

    </div>

    <div class="card">

        <h2>
            Sensecap Wi-Fi
        </h2>

        <p style="color:var(--muted); font-size:13px; margin-bottom:12px">
            Configure a local Sensecap M1 endpoint for thermometers that send readings to the PWA over Wi‑Fi.
        </p>

        <label>
            Endpoint URL
        </label>

        <input
            type="text"
            value="${appState.sensecap.endpoint}"
            oninput="setSensecapEndpoint(this.value)"
            placeholder="http://192.168.x.x/api/temperature"
        >

        <label>
            Poll interval (seconden)
        </label>

        <input
            type="number"
            min="5"
            value="${appState.sensecap.pollingIntervalSeconds}"
            onchange="setSensecapPollingInterval(this.value)"
        >

        <div class="bluetooth-status">
            Status: ${appState.sensecap.status}
        </div>

        ${appState.sensecap.error ? `<p class="bluetooth-error">${appState.sensecap.error}</p>` : ""}

        <div class="button-row">
            <button class="button" onclick="setSensecapEnabled(!appState.sensecap.enabled)">
                ${appState.sensecap.enabled ? "Stop" : "Start"}
            </button>
        </div>

    </div>

    <div class="card">
    <h2>Alerts</h2>

    ${appState.alerts.history.length
            ? appState.alerts.history
                .slice(0, 10)
                .map(alert => `
                    <div class="alert-item">
                        <strong>${alert.type}</strong>
                        ${alert.message}
                    </div>
                `)
                .join("")
            : `
                <p>Geen alerts</p>
            `
        }
    </div>




    <div class="card">

        <h2>

            Brand theme

        </h2>

        <label>
            App appearance
        </label>

        <select
            class="button theme-select"
            onchange="setTheme(this.value)"
        >
            ${Object.entries(THEME_PRESETS).map(([key, preset]) => `
                <option value="${key}" ${appState.theme.preset === key ? "selected" : ""}>
                    ${preset.brand}
                </option>
            `).join("")}
        </select>

        <p style="color:var(--muted); margin-top:12px;">
            Current theme: ${appState.theme.brand}
        </p>

        <p style="color:var(--muted)">

            Temperatuureenheid: ${appState.settings.temperatureUnit === "C" ? "Celsius" : "Fahrenheit"}

        </p>

    </div>

    <div class="card">

    <h3>
        Display
    </h3>

    <label>

        <input
            type="checkbox"
            ${
                appState.settings.keepScreenAwake
                    ? "checked"
                    : ""
            }
            onchange="
                appState.settings.keepScreenAwake=this.checked;
                saveAppState();
                if (typeof syncWakeLockState === 'function') {
                    syncWakeLockState();
                }
            "
        >

        Keep screen awake during active cook

    </label>

    <p style='color:var(--muted); margin-top:8px;'>
        ${
            typeof navigator !== "undefined" && "wakeLock" in navigator
                ? "Wake Lock is supported in this browser."
                : "Safari/Bluefy fallback is active; the app will try to keep the screen awake using a silent audio workaround."
        }
    </p>

    </div>

    `;

    
}
