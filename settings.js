/* ==========================================================
   Hermanos Grill Companion
   settings.js

   Instellingen scherm: sondebeheer (tot 6 sondes) + app instellingen
   ========================================================== */


// Startwaarde voor een sonde die net actief wordt en nog geen meting heeft
function defaultStartTemperature(type){

    if(type === "dome") return 20;

    if(type === "meat") return 15;

    if(type === "ambient") return 20;

    return null;

}


function toggleProbeActive(id){

    const probe = appState.probes.find(p => p.id === id);

    if(!probe) return;


    probe.active = !probe.active;


    // Bij activeren zonder rol: standaard op "vlees" zetten
    if(probe.active && probe.type === "unused"){

        probe.type = "meat";

    }


    // Zorg dat een net actieve sonde direct een zinnige waarde heeft
    if(probe.active && probe.temperature === null){

        probe.temperature = defaultStartTemperature(probe.type);

    }


    render();

}


function setProbeType(id, type){

    const probe = appState.probes.find(p => p.id === id);

    if(!probe) return;


    probe.type = type;


    if(probe.active && probe.temperature === null){

        probe.temperature = defaultStartTemperature(type);

    }


    render();

}


function setProbeName(id, name){

    const probe = appState.probes.find(p => p.id === id);

    if(!probe) return;


    probe.name = name;

    // geen render() hier: anders springt de cursor in het tekstveld weg
    // tijdens het typen. De naam staat al bij de volgende render goed.

}


function setBluetoothStatus(status, error = ""){

    appState.bluetooth.status = status;
    appState.bluetooth.error = error;

    render();

}


function parseTemperaturePayload(payload){

    if(!payload) return null;

    const values = payload.split(/[^0-9.-]+/).filter(Boolean);

    if(values.length >= 1){
        const temp = Number(values[0]);
        if(Number.isFinite(temp)) return temp;
    }

    return null;

}


function applyTemperatureReading(rawValue){

    const temperature = parseTemperaturePayload(rawValue);

    if(temperature === null) return;

    const domeProbe = appState.probes.find(p => p.active && p.type === "dome");
    const meatProbe = appState.probes.find(p => p.active && p.type === "meat");

    if(domeProbe){
        domeProbe.temperature = temperature;
    }

    if(meatProbe){
        meatProbe.temperature = temperature;
    }

    appState.bluetooth.lastPayload = rawValue;
    appState.bluetooth.lastUpdatedAt = new Date().toISOString();

    updateLiveUi();

}


async function connectBluetoothDevice(){

    if(!navigator.bluetooth || !navigator.bluetooth.requestDevice){

        setBluetoothStatus("Not supported", "Web Bluetooth is not available in this browser.");

        return;

    }


    try{

        setBluetoothStatus("Requesting device...");

        const device = await navigator.bluetooth.requestDevice({
            filters: [
                { namePrefix: "Grill" },
                { namePrefix: "BT" },
                { namePrefix: "Thermo" },
                { namePrefix: "Probe" }
            ],
            optionalServices: [
                appState.bluetooth.serviceUuid,
                "battery_service"
            ]
        });


        appState.bluetooth.device = device.name || "Bluetooth device";
        appState.bluetooth.deviceRef = device;
        appState.bluetooth.battery = null;
        appState.bluetooth.error = "";

        setBluetoothStatus("Connecting...");

        const server = await device.gatt.connect();

        try{

            const service = await server.getPrimaryService(appState.bluetooth.serviceUuid);
            const characteristic = await service.getCharacteristic(appState.bluetooth.characteristicUuid);

            await characteristic.startNotifications();

            characteristic.addEventListener("characteristicvaluechanged", event => {
                const value = event.target.value;
                const decoder = new TextDecoder();
                const rawValue = decoder.decode(value);
                applyTemperatureReading(rawValue);
            });

            const initialValue = await characteristic.readValue();
            const decoder = new TextDecoder();
            const rawValue = decoder.decode(initialValue);

            applyTemperatureReading(rawValue);

            appState.bluetooth.connected = true;
            appState.bluetooth.status = "Connected";
            render();

        } catch(serviceError){

            try{
                const batteryService = await server.getPrimaryService("battery_service");
                const batteryCharacteristic = await batteryService.getCharacteristic("battery_level");
                const batteryValue = await batteryCharacteristic.readValue();
                appState.bluetooth.battery = batteryValue.getUint8(0);
            } catch(batteryError){
                appState.bluetooth.battery = null;
            }

            appState.bluetooth.connected = true;
            appState.bluetooth.status = "Connected";
            appState.bluetooth.error = serviceError?.message || "Device connected, but no temperature service was found.";

            render();

        }

    } catch(err){

        appState.bluetooth.connected = false;
        appState.bluetooth.device = null;
        appState.bluetooth.deviceRef = null;
        appState.bluetooth.battery = null;
        appState.bluetooth.error = err?.message || "Bluetooth connection failed.";
        appState.bluetooth.status = "Connection failed";

        render();

    }

}


function disconnectBluetoothDevice(){

    if(appState.bluetooth.deviceRef?.gatt?.connected){

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


function settingsView(){

    return `

    <div class="card">

        <h2>

            Sondes

        </h2>

        <p style="color:var(--muted); font-size:13px; margin-bottom:14px">

            Tot 6 sondes. Zet een sonde aan en kies de rol
            (dome / vlees / ambient). Inactieve sondes worden
            niet getoond op het dashboard.

        </p>

        ${

            appState.probes.map(p => `

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
                        ${p.active ? "Aan" : "Uit"}
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

            Verbind met een apparaat via Web Bluetooth in Bluefy. Dit is een eerste stap voor thermometer-verbindingen.

        </p>

        <div class="bluetooth-status">
            Status: ${appState.bluetooth.status}
        </div>

        <div class="bluetooth-meta">
            Apparaat: ${appState.bluetooth.device || "Geen apparaat geselecteerd"}
        </div>

        ${appState.bluetooth.battery !== null ? `<div class="bluetooth-meta">Battery: ${appState.bluetooth.battery}%</div>` : ""}

        ${appState.bluetooth.error ? `<p class="bluetooth-error">${appState.bluetooth.error}</p>` : ""}

        <div class="button-row">
            <button class="button" onclick="connectBluetoothDevice()">
                ${appState.bluetooth.connected ? "Herconnecteren" : "Verbinden"}
            </button>

            <button class="button secondary" onclick="disconnectBluetoothDevice()" ${appState.bluetooth.connected ? "" : "disabled"}>
                Ontkoppelen
            </button>
        </div>

    </div>


    <div class="card">

        <h2>

            ${appState.theme.brand}

        </h2>

        <p style="color:var(--muted)">

            Temperatuureenheid: ${appState.settings.temperatureUnit === "C" ? "Celsius" : "Fahrenheit"}

        </p>

    </div>

    `;

}
