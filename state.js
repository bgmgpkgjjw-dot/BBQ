/* ==========================================================
   Hermanos Grill Companion
   state.js

   Centrale data opslag van de applicatie
   ========================================================== */


const appState = {


    // Welk scherm is actief?
    screen: "dashboard",



    // Recept dat momenteel bekeken wordt
    selectedRecipe: null,

    recipeScale: 1,



    // Verbinding thermometer
    bluetooth: {

        connected: false,

        device: null,

        deviceRef: null,

        battery: null,

        status: "Not connected",

        error: "",

        serviceUuid: "0000ffb0-0000-1000-8000-00805f9b34fb",

        characteristicUuid: "0000ffb2-0000-1000-8000-00805f9b34fb",

        lastPayload: "",

        lastUpdatedAt: null

    },



    // Thema / merk
    theme: {

        brand: "Kamado Joe",

        accent: "#C1272D"

    },



    // ======================================================
    // ACTIEVE COOK
    // ======================================================

    cook: {

        active: false,

        name: "",


        // Temperatuur doelen

        domeTarget: 110,

        meatTarget: 92,



        // Algemene informatie

        duration: "",


        // Fase management

        phase: 0,

        phases: [],


        // Premium cook tracking

        startedAt: null,

        lastPhaseChange: null,

        completedPhases: [],


        // Voor toekomstige uitbreidingen

        estimatedFinish: null,

        elapsedSeconds: 0,

        notes: ""

    },

// ==========================================================
// Saved cook sessions
// ==========================================================

sessions: [],

currentSessionId: null,


    // ======================================================
    // TEMPERATUURSENSOREN
    // ======================================================

    probes: [

        {
            id: 1,

            name: "Dome",

            type: "dome",

            temperature: null,

            active: true

        },


        {
            id: 2,

            name: "Vlees",

            type: "meat",

            temperature: null,

            active: true

        },


        {
            id: 3,

            name: "Probe 3",

            type: "unused",

            temperature: null,

            active: false

        },


        {
            id: 4,

            name: "Probe 4",

            type: "unused",

            temperature: null,

            active: false

        },


        {
            id: 5,

            name: "Probe 5",

            type: "unused",

            temperature: null,

            active: false

        },


        {
            id: 6,

            name: "Probe 6",

            type: "unused",

            temperature: null,

            active: false

        }

    ],



    // ======================================================
    // MELDINGEN / HISTORIE
    // ======================================================

    alerts: {

        enabled: true,

        meatTemperature: 65,

        domeDeviation: 8,

        history: []

    },

    // Temperatuur historie
    history: {

        activeSession: {

            startedAt: null,

            samples: []

        },


        sessions: []

    },

    // ======================================================
    // APP INSTELLINGEN
    // ======================================================

    settings: {

        notifications: true,

        temperatureUnit: "C",

        firstRun: false

    }


};





// ==========================================================
// STATE UPDATE HELPER
// ==========================================================

function updateState(callback){


    callback(appState);



    if(typeof render === "function"){

        render();

    }


}

