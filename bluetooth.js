/* ==========================================================
   Hermanos Grill Companion
   bluetooth.js
   BLE connection and notification handling
   ========================================================== */

const BLE = {

    SERVICE: "0000ffb0-0000-1000-8000-00805f9b34fb",

    WRITE: "0000ffb1-0000-1000-8000-00805f9b34fb",

    NOTIFY: "0000ffb2-0000-1000-8000-00805f9b34fb",

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
    const bytes = [];

    for(let i = 0; i < value.byteLength; i++){
        bytes.push(value.getUint8(i));
    }

    console.log("BLE:", bytes);
    console.log(
        "HEX:",
        bytes.map(b => b.toString(16).padStart(2, "0")).join(" ")
    );

    const rawValue = bytes.map(b => String.fromCharCode(b)).join("");
    applyTemperatureReading(rawValue);
}


async function connectBluetooth(){

    try{

        console.log("Zoeken naar thermometer...");

        BLE.device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "Grill" }],
            optionalServices: [BLE.SERVICE]
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
