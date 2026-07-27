/* ==========================================================
   Hermanos Grill Companion
   state.js

   Centrale data opslag van de applicatie
   ========================================================== */


const appState = {


    // Actief scherm
    screen: "dashboard",


    // Recept selectie
    selectedRecipe: null,

    recipeScale: 1,


    // ======================================================
    // Bluetooth thermometer
    // ======================================================

    bluetooth: {

        connected: false,

        device: null,

        deviceRef: null,

        battery: null,

        status: "Not connected",

        error: "",


        serviceUuid:
        "0000ffb0-0000-1000-8000-00805f9b34fb",


        characteristicUuid:
        "0000ffb2-0000-1000-8000-00805f9b34fb",


        lastPayload: "",

        lastUpdatedAt: null

    },



    // ======================================================
    // Thema
    // ======================================================

    theme: {

        brand: "Kamado Joe",

        accent: "#C1272D"

    },



    // ======================================================
    // Actieve cook
    // ======================================================

    cook: {

        active: false,

        name: "",

        domeTarget: 110,

        meatTarget: 92,

        duration: "",

        phase: 0,

        phases: [],

        ingredients: [],

        servings: null

    },



    // ======================================================
    // Probes
    // ======================================================

    probes: [

        {
            id:1,

            name:"Dome",

            type:"dome",

            temperature:null,

            active:true
        },


        {
            id:2,

            name:"Vlees",

            type:"meat",

            temperature:null,

            active:true
        },


        {
            id:3,

            name:"Probe 3",

            type:"unused",

            temperature:null,

            active:false
        },


        {
            id:4,

            name:"Probe 4",

            type:"unused",

            temperature:null,

            active:false
        },


        {
            id:5,

            name:"Probe 5",

            type:"unused",

            temperature:null,

            active:false
        },


        {
            id:6,

            name:"Probe 6",

            type:"unused",

            temperature:null,

            active:false
        }

    ],



    // ======================================================
    // Alerts + historie
    // ======================================================

    alerts: {

        enabled:true,

        meatTemperature:65,

        domeDeviation:8,

        history:[]

    },



    // ======================================================
    // Recipe database
    //
    // Wordt geladen vanuit recipes-data.js
    // ======================================================

    recipes: [],



    // ======================================================
    // Algemene instellingen
    // ======================================================

    settings: {


        notifications:true,


        temperatureUnit:"C",


        firstRun:false


    }



};





// ==========================================================
// State update helper
// ==========================================================

function updateState(callback){


    callback(appState);


    if(typeof render === "function"){

        render();

    }

}