/* ==========================================================
   Hermanos Grill Companion
   bluetooth.js
   BLE connection and notification handling
   ========================================================== */

const BLE = {

    SERVICE: "0000ffb0-0000-1000-8000-00805f9b34fb",

    WRITE: "0000ffb1-0000-1000-8000-00805f9b34fb",

    NOTIFY: "0000ffb2-0000-1000-8000-00805f9b34fb",

    HEADER_LENGTH: 3,

    device: null,
    server: null,
    service: null,

    writeCharacteristic: null,
    notifyCharacteristic: null
};


function onBluetoothDisconnected(){
    console.log("Bluetooth verbroken");

    appState.bluetooth.connected = false;
    appState.bluetooth.status = "Disconnected";
    appState.bluetooth.error = "Bluetooth connection lost.";

    render();
}


function handleBluetoothNotification(event){
    const value = event.target.value;
    const bytes = new Uint8Array(value.buffer);

    appState.bluetooth.lastRawHex = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join(" ");

    appState.bluetooth.lastPayload = appState.bluetooth.lastRawHex;
    appState.bluetooth.lastUpdatedAt = new Date().toISOString();

    console.log("BLE length:", bytes.length);
    console.log("BLE:", Array.from(bytes));
    console.log("HEX:", appState.bluetooth.lastRawHex);

    const candidateOffsets = [BLE.HEADER_LENGTH, 0, 1, 2, 4];

    let decodedAny = false;

    for(const offsetBase of candidateOffsets){
        const parsed = [];

        for(let i = 0; i < 6; i++){
            const offset = offsetBase + (i * 2);

            if(offset + 1 >= bytes.length) break;

            const raw = bytes[offset] | (bytes[offset + 1] << 8);
            parsed.push(raw);
        }

        if(parsed.some(value => value !== 0 && value !== 0xFFFF)){
            decodedAny = true;

            parsed.forEach((raw, index) => {
                const probe = appState.probes.find(p => p.id === index + 1);
                if(!probe) return;
                if(raw === 0xFFFF || raw === 0) return;
                probe.temperature = raw / 10;
            });

            break;
        }
    }

    if(!decodedAny){
        console.warn("No temperature values decoded from BLE packet.");
    }

    updateLiveUi();
    render();
}


async function connectBluetooth(){

    try{

        console.log("Zoeken naar thermometer...");

        BLE.device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "Grill" }],
            optionalServices: [
                BLE.SERVICE,
                "0000ffb0-0000-1000-8000-00805f9b34fb",
                "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
                "0000fff0-0000-1000-8000-00805f9b34fb",
                "0000ffe0-0000-1000-8000-00805f9b34fb",
                "battery_service"
            ]
        });

        BLE.device.addEventListener("gattserverdisconnected", onBluetoothDisconnected);

        BLE.server = await BLE.device.gatt.connect();
        console.log("Verbonden");

        BLE.service = await BLE.server.getPrimaryService(BLE.SERVICE);

        BLE.writeCharacteristic = await BLE.service.getCharacteristic(BLE.WRITE);
        BLE.notifyCharacteristic = await BLE.service.getCharacteristic(BLE.NOTIFY);

        await BLE.notifyCharacteristic.startNotifications();
        BLE.notifyCharacteristic.addEventListener("characteristicvaluechanged", handleBluetoothNotification);

        console.log("Notifications gestart");

        appState.bluetooth.device = BLE.device.name || "Bluetooth device";
        appState.bluetooth.deviceRef = BLE.device;
        appState.bluetooth.connected = true;
        appState.bluetooth.status = "Connected";
        appState.bluetooth.error = "";

        render();

    } catch(error){
        console.error(error);

        appState.bluetooth.connected = false;
        appState.bluetooth.device = null;
        appState.bluetooth.deviceRef = null;
        appState.bluetooth.status = "Connection failed";
        appState.bluetooth.error = error?.message || "Bluetooth connection failed.";

        render();
    }

}


async function sendCommand(bytes){

    if(!BLE.writeCharacteristic){
        return;
    }

    await BLE.writeCharacteristic.writeValue(new Uint8Array(bytes));
}
