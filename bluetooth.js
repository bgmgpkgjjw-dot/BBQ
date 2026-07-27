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
    notifyCharacteristic: null,


    // Used later when we decode probe identity
    lastActiveProbe: null
};





function onBluetoothDisconnected(){

    console.log("Bluetooth verbroken");


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



    console.log("--------------------------------");
    console.log("BLE length:", bytes.length);
    console.log("HEX:", hex);
    console.log("BYTES:", Array.from(bytes));



    /*
        Packet format discovered:

        Header:

        byte 0:
        55

        byte 1:
        00


        Status packets:

        55 00 xx xx xx xx FF FF FF FF FF FF FF FF 00


        Temperature packets:

        55 00 FF FF FF FF TT TT FF FF FF FF FF FF 00


        Temperature:

        TT TT = BIG ENDIAN

        Example:

        01 16

        = 278

        = 27.8°C
    */





    /*
        Ignore status packets

        These contain probe/channel information
        but no temperature.
    */


    if(bytes[2] !== 0xFF){


        console.log(
            "Status packet:",
            bytes[2],
            bytes[3],
            bytes[4],
            bytes[5]
        );


        BLE.lastActiveProbe =
            bytes[3];


        console.log(
            "Stored probe identifier:",
            BLE.lastActiveProbe
        );


        return;

    }






    /*
        Temperature starts at byte 6
    */


    const raw =
        (bytes[6] << 8) |
        bytes[7];



    console.log(
        "Temperature raw:",
        raw
    );




    /*
        No probe connected
    */


    if(raw === 0xFFFF || raw === 0){


        console.log(
            "No valid temperature"
        );


        return;

    }





    const temperature =
        raw / 10;



    console.log(
        "Temperature:",
        temperature,
        "°C"
    );






    /*
        Temporary mapping

        Until we identify the real probe ID,
        put temperature on first free probe.

        This avoids wrong 6000°C values.
    */


    let targetProbe = null;



    if(BLE.lastActiveProbe){


        console.log(
            "Possible probe ID:",
            BLE.lastActiveProbe
        );

    }





    targetProbe =
        appState.probes.find(
            p =>
                p.temperature === null ||
                p.temperature === undefined
        );



    if(!targetProbe){

        targetProbe =
            appState.probes[0];

    }




    if(targetProbe){


        targetProbe.temperature =
            temperature;


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






        await BLE.notifyCharacteristic
            .startNotifications();






        BLE.notifyCharacteristic
            .addEventListener(
                "characteristicvaluechanged",
                handleBluetoothNotification
            );






        console.log(
            "Notifications gestart"
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



    await BLE.writeCharacteristic
        .writeValue(
            new Uint8Array(bytes)
        );

}