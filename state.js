/* ==========================================================
   Hermanos Grill Companion
   state.js

   Centrale data opslag van de applicatie
   ========================================================== */


const THEME_PRESETS = {
    default: {
        brand: "Default",
        accent: "#C88B3D",
        accentLight: "#E2B36C",
        buttonStart: "#C68B35",
        buttonEnd: "#9E6628",
        progressStart: "#C88B3D",
        progressEnd: "#E2B36C"
    },
    "kamado-joe": {
        brand: "Kamado Joe",
        accent: "#C1272D",
        accentLight: "#E06063",
        buttonStart: "#C1272D",
        buttonEnd: "#8A1D24",
        progressStart: "#C1272D",
        progressEnd: "#E06063"
    },
    "big-green-egg": {
        brand: "Big Green Egg",
        accent: "#1F6F43",
        accentLight: "#5DAA7C",
        buttonStart: "#1F6F43",
        buttonEnd: "#134C2F",
        progressStart: "#1F6F43",
        progressEnd: "#5DAA7C"
    },
    monolith: {
        brand: "Monolith",
        accent: "#1A1A1A",
        accentLight: "#5A5A5A",
        buttonStart: "#111111",
        buttonEnd: "#2A2A2A",
        progressStart: "#111111",
        progressEnd: "#5A5A5A"
    }
};

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

        status: "Not connected",

        error: "",

        serviceUuid: "0000ffb0-0000-1000-8000-00805f9b34fb",

        characteristicUuid: "0000ffb2-0000-1000-8000-00805f9b34fb",

        lastPayload: "",

        lastUpdatedAt: null

    },



    // Thema / merk
    theme: {

        preset: "default",

        brand: "Default",

        accent: "#C88B3D",

        accentLight: "#E2B36C",

        buttonStart: "#C68B35",

        buttonEnd: "#9E6628",

        progressStart: "#C88B3D",

        progressEnd: "#E2B36C"

    },

    //History zien
    selectedHistory: null,

    // AI Recepeten
    ai: {
        ingredients: "",
        category: "anything",
        loading: false,
        results: [],
        savedRecipes: []
    },

    network: {
        enabled: false,
        serverAddress: "192.168.68.127",
        apiToken: "",
        connected: false,
        status: "Disabled",
        error: "",
        lastUpdatedAt: null,
        lastConnectedAt: null,
        lastPayload: ""
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


        // For future expansion

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

            name: "Meat",

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

        approachingThreshold: 5,

        history: []

    },

    // ======================================================
    // APP SETTINGS
    // ======================================================

     settings: {

        notifications: true,

        notificationSound: true,

        notificationHaptics: true,

        temperatureUnit: "C",

        firstRun: false,

        keepScreenAwake: true

    },


};





// ==========================================================
// STATE UPDATE HELPER
// ==========================================================

function updateState(callback) {


    callback(appState);

    if (
        typeof scheduleStateSave ===
        "function"
    ) {
        scheduleStateSave();
    }

    if (typeof render === "function") {

        render();

    }


}



function recordAlert(type, message) {

    appState.alerts.history.unshift({
        type,
        message,
        timestamp:
            new Date().toISOString()
    });

    if (
        appState.alerts.history.length > 100
    ) {
        appState.alerts.history.pop();
    }

    if (typeof saveAppState === "function") {
        saveAppState();
    }
}



