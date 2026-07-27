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

    console.log("BLE:", Array.from(bytes));
    console.log("HEX:", appState.bluetooth.lastRawHex);

    for(let i = 0; i < 6; i++){
        const offset = BLE.HEADER_LENGTH + (i * 2);

        if(offset + 1 >= bytes.length) break;

        const raw = bytes[offset] | (bytes[offset + 1] << 8);
        const probe = appState.probes.find(p => p.id === i + 1);

        if(!probe) continue;

        if(raw === 0xFFFF) continue;

        probe.temperature = raw / 10;
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
