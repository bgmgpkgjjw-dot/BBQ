/* ==========================================================
   Hermanos Grill Companion

   state.js

   Central application state

   Premium cooking model
   ========================================================== */



const appState = {



    /*
    ----------------------------------------------------------
    APP
    ----------------------------------------------------------
    */


    screen:
        "dashboard",



    version:
        "2.0",





    /*
    ----------------------------------------------------------
    BLUETOOTH
    ----------------------------------------------------------
    */


    bluetooth:{


        connected:
            false,


        device:
            null,


        deviceRef:
            null,


        status:
            "Disconnected",


        error:
            "",


        battery:
            null,


        lastRawHex:
            "",


        lastPayload:
            "",


        lastUpdatedAt:
            null,


        /*
        Future BLE settings
        */

        writeSupported:
            false,


        lastCommand:
            null


    },








    /*
    ----------------------------------------------------------
    PROBES
    ----------------------------------------------------------

    id:
    internal app id

    bleId:
    hardware identifier discovered
    */


    probes:[


        {

            id:1,

            bleId:null,

            name:
                "Probe 1",

            type:
                "unused",

            active:
                false,

            temperature:
                null,


            history:[],

            connected:
                false,


            alarm:
                {

                    enabled:false,

                    target:null

                }


        },



        {

            id:2,

            bleId:null,

            name:
                "Probe 2",

            type:
                "unused",

            active:
                false,

            temperature:
                null,


            history:[],

            connected:
                false,


            alarm:
                {

                    enabled:false,

                    target:null

                }


        },



        {

            id:3,

            bleId:null,

            name:
                "Probe 3",

            type:
                "unused",

            active:
                false,

            temperature:
                null,


            history:[],

            connected:
                false,


            alarm:
                {

                    enabled:false,

                    target:null

                }


        },



        {

            id:4,

            bleId:null,

            name:
                "Probe 4",

            type:
                "unused",

            active:
                false,

            temperature:
                null,


            history:[],

            connected:
                false,


            alarm:
                {

                    enabled:false,

                    target:null

                }


        },



        {

            id:5,

            bleId:null,

            name:
                "Probe 5",

            type:
                "unused",

            active:
                false,

            temperature:
                null,


            history:[],

            connected:
                false,


            alarm:
                {

                    enabled:false,

                    target:null

                }


        },



        {

            id:6,

            bleId:null,

            name:
                "Probe 6",

            type:
                "unused",

            active:
                false,

            temperature:
                null,


            history:[],

            connected:
                false,


            alarm:
                {

                    enabled:false,

                    target:null

                }


        }


    ],









    /*
    ----------------------------------------------------------
    COOK SESSION
    ----------------------------------------------------------
    */


    cook:{


        active:
            false,


        name:
            "",


        recipeId:
            null,


        startedAt:
            null,


        finishedAt:
            null,



        domeTarget:
            120,


        meatTarget:
            null,



        status:
            "idle",


        /*
        possible values:

        idle
        heating
        cooking
        resting
        finished

        */


        notes:
            "",


        durationSeconds:
            0



    },









    /*
    ----------------------------------------------------------
    COOK HISTORY
    ----------------------------------------------------------
    */


    history:{


        sessions:[]



    },








    /*
    ----------------------------------------------------------
    RECIPES
    ----------------------------------------------------------
    */


    selectedRecipe:
        null,









    /*
    ----------------------------------------------------------
    SETTINGS
    ----------------------------------------------------------
    */


    settings:{


        temperatureUnit:
            "C",


        notifications:
            true,


        sound:
            true,


        keepScreenAwake:
            true



    }



};









/*
==============================================================
HELPER FUNCTIONS
==============================================================
*/





function updateProbeTemperature(
    probeId,
    temperature
){


    const probe =
        appState.probes.find(
            p=>p.id===probeId
        );


    if(!probe){
        return;
    }



    probe.temperature =
        temperature;


    probe.connected =
        true;



    /*
    Save temperature history

    Maximum:
    one point every update
    later we can throttle this
    */


    probe.history.push({

        time:
            Date.now(),

        temperature

    });



    /*
    Keep last 500 points
    */


    if(
        probe.history.length > 500
    ){

        probe.history.shift();

    }



}









function resetProbe(
    probeId
){


    const probe =
        appState.probes.find(
            p=>p.id===probeId
        );


    if(!probe){
        return;
    }



    probe.temperature =
        null;


    probe.connected =
        false;


}









function startCook(
    name,
    recipeId=null
){


    appState.cook.active =
        true;


    appState.cook.name =
        name;


    appState.cook.recipeId =
        recipeId;


    appState.cook.startedAt =
        Date.now();


    appState.cook.status =
        "heating";


}









function finishCook(){


    appState.cook.finishedAt =
        Date.now();


    appState.cook.active =
        false;


    appState.cook.status =
        "finished";


}









function getCookDuration(){


    if(
        !appState.cook.startedAt
    ){

        return 0;

    }



    return Math.floor(

        (
            Date.now()
            -
            appState.cook.startedAt
        )
        /
        1000

    );


}