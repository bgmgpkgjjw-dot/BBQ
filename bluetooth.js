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

    debug("Bluetooth disconnected");


    appState.bluetooth.connected = false;
    appState.bluetooth.status = "Disconnected";
    appState.bluetooth.error =
        "Bluetooth connection lost.";


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
    appState.bluetooth.lastUpdatedAt =
        new Date().toISOString();



    debug("--------------------------------");
    debug("BLE length:", bytes.length);
    debug("HEX:", hex);
    debug("BYTES:", Array.from(bytes));





    const probeSlots = [

        {
            id: 1,
            offset: 2
        },

        {
            id: 2,
            offset: 4
        },

        {
            id: 3,
            offset: 6
        },

        {
            id: 4,
            offset: 8
        },

        {
            id: 5,
            offset: 10
        },

        {
            id: 6,
            offset: 12
        }

    ];








    probeSlots.forEach(slot => {



        const high =
            bytes[slot.offset];

        const low =
            bytes[slot.offset + 1];



        if(high === undefined || low === undefined){

            return;

        }





        const raw =
            (high << 8) |
            low;





        const probe =
            appState.probes.find(
                p => p.id === slot.id
            );



        if(!probe){

            return;

        }







        if(raw === 0xFFFF){


            probe.temperature = null;


            return;

        }








        if(raw === 0){

            return;

        }








        const temperature =
            raw / 10;





        probe.temperature =
            temperature;






        debug(
            "Probe",
            slot.id,
            temperature,
            "°C"
        );



    });






    /*
        SAVE TEMPERATURE SAMPLE

        Stores current probe values
        for history graph.

        history.js handles the storage.
    */

    if(typeof recordTemperatureHistory === "function"){

        recordTemperatureHistory();

    }






    updateLiveUi();

    render();


}









async function connectBluetooth(){


    try{


        debug(
            "Searching for thermometer..."
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






        await BLE.notifyCharacteristic
            .startNotifications();






        BLE.notifyCharacteristic
            .addEventListener(
                "characteristicvaluechanged",
                handleBluetoothNotification
            );






        debug(
            "Notifications started"
        );






        appState.bluetooth.device =
            BLE.device.name ||
            "Bluetooth device";



        appState.bluetooth.deviceRef =
            BLE.device;



        appState.bluetooth.connected =
            true;



        appState.bluetooth.status =
            "Connected";



        appState.bluetooth.error =
            "";



        render();




    }
    catch(error){



        console.error(error);



        appState.bluetooth.connected =
            false;



        appState.bluetooth.device =
            null;



        appState.bluetooth.deviceRef =
            null;



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