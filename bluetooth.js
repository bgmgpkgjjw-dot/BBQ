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

    const bytes = new Uint8Array(value.buffer);


    const hex = Array.from(bytes)
        .map(b => b.toString(16).padStart(2,"0"))
        .join(" ");


    appState.bluetooth.lastRawHex = hex;
    appState.bluetooth.lastPayload = hex;
    appState.bluetooth.lastUpdatedAt = new Date().toISOString();


    console.log("--------------------------------");
    console.log("BLE length:", bytes.length);
    console.log("HEX:", hex);
    console.log("BYTES:", Array.from(bytes));



    /*
        Expected packet:

        55 00 xx FD 01 xx
        TT TT TT TT TT TT
        TT = temperature * 10

        Probe data starts at byte 6
    */


    const probeStart = 6;


    let decodedAny = false;


    for(let i = 0; i < 6; i++){


        const offset = probeStart + (i * 2);


        if(offset + 1 >= bytes.length){
            continue;
        }


        const raw =
            bytes[offset] |
            (bytes[offset + 1] << 8);



        console.log(
            "BLE Channel",
            i + 1,
            "raw:",
            raw
        );



        // disconnected probe
        if(raw === 0xFFFF){

            console.log(
                "Channel",
                i + 1,
                "not connected"
            );

            continue;
        }



        if(raw === 0){

            continue;
        }



        const temperature = raw / 10;



        console.log(
            "Channel",
            i + 1,
            "temperature:",
            temperature,
            "°C"
        );



        /*
            Temporary mapping:
            BLE channel 1 -> App probe 1
            BLE channel 2 -> App probe 2
            ...
            BLE channel 6 -> App probe 6

            We can adjust after testing.
        */


        const probe = appState.probes[i];


        if(probe){

            probe.temperature = temperature;

            decodedAny = true;
        }

    }



    if(!decodedAny){

        console.warn(
            "No valid temperatures decoded"
        );

    }


    updateLiveUi();

    render();

}







async function connectBluetooth(){


    try{


        console.log(
            "Zoeken naar thermometer..."
        );



        BLE.device =
            await navigator.bluetooth.requestDevice({

                filters: [
                    {
                        namePrefix: "Grill"
                    }
                ],

                optionalServices: [

                    BLE.SERVICE,

                    "0000ffb0-0000-1000-8000-00805f9b34fb",

                    "6e400001-b5a3-f393-e0a9-e50e24dcca9e",

                    "0000fff0-0000-1000-8000-00805f9b34fb",

                    "0000ffe0-0000-1000-8000-00805f9b34fb",

                    "battery_service"

                ]

            });



        BLE.device.addEventListener(
            "gattserverdisconnected",
            onBluetoothDisconnected
        );



        BLE.server =
            await BLE.device.gatt.connect();



        console.log(
            "Verbonden"
        );



        BLE.service =
            await BLE.server.getPrimaryService(
                BLE.SERVICE
            );



        BLE.writeCharacteristic =
            await BLE.service.getCharacteristic(
                BLE.WRITE
            );



        BLE.notifyCharacteristic =
            await BLE.service.getCharacteristic(
                BLE.NOTIFY
            );



        await BLE.notifyCharacteristic.startNotifications();



        BLE.notifyCharacteristic.addEventListener(
            "characteristicvaluechanged",
            handleBluetoothNotification
        );



        console.log(
            "Notifications gestart"
        );



        appState.bluetooth.device =
            BLE.device.name || "Bluetooth device";


        appState.bluetooth.deviceRef =
            BLE.device;


        appState.bluetooth.connected = true;


        appState.bluetooth.status =
            "Connected";


        appState.bluetooth.error =
            "";



        render();



    }
    catch(error){


        console.error(error);


        appState.bluetooth.connected = false;

        appState.bluetooth.device = null;

        appState.bluetooth.deviceRef = null;

        appState.bluetooth.status =
            "Connection failed";


        appState.bluetooth.error =
            error?.message ||
            "Bluetooth connection failed.";


        render();

    }

}







async function sendCommand(bytes){


    if(!BLE.writeCharacteristic){

        return;

    }


    await BLE.writeCharacteristic.writeValue(
        new Uint8Array(bytes)
    );

}
