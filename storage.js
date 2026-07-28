/* ==========================================================
   Hermanos Grill Companion

   storage.js

   Local cook storage
   ========================================================== */

const STORAGE_KEY = "hermanos_grill_sessions_v1";
const APP_STATE_KEY = "hermanos_grill_app_state_v1";


/* ==========================================================
   INITIALIZE
========================================================== */

function initializeStorage() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        appState.sessions =
            saved
                ?
                JSON.parse(saved)
                :
                [];

    }
    catch (error) {

        console.error(
            "Unable to load sessions",
            error
        );

        appState.sessions = [];

    }

}


/* ==========================================================
   SAVE
========================================================== */

function saveSessions() {

    try {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(
                appState.sessions
            )

        );

    }
    catch (error) {

        console.error(
            "Unable to save sessions",
            error
        );

    }

}


/* ==========================================================
   START SESSION
========================================================== */

function startCookSession() {

    const session = {

        id:
            Date.now().toString(),

        name: appState.cook.name ||
            "Nieuwe cook",

        recipe: appState.cook.recipe ||
            null,

        startedAt:
            new Date().toISOString(),

        finishedAt:
            null,

        duration:
            null,

        domeTarget:
            appState.cook.domeTarget,

        meatTarget:
            appState.cook.meatTarget,

        phases:
            structuredClone(
                appState.cook.phases || []
            ),

        temperatureHistory: [],

        notes: "",

        rating: null

    };


    appState.currentSessionId =
        session.id;


    appState.sessions.unshift(
        session
    );


    saveSessions();

}


/* ==========================================================
   FINISH SESSION
========================================================== */

function finishCookSession() {

    const session =
        getCurrentSession();


    if (!session) {

        console.warn(
            "No active cook session found"
        );

        return;

    }



    session.finishedAt =
        new Date().toISOString();



    session.duration =
        calculateDuration(
            session.startedAt,
            session.finishedAt
        );



    saveSessions();



    console.log(
        "Cook session saved:",
        session
    );


}


/* ==========================================================
   RECORD TEMPERATURE
========================================================== */

function recordTemperatureHistory() {

    if (!appState.cook.active) {
        return;
    }

    const session = getCurrentSession();

    if (!session) {
        return;
    }

    session.temperatureHistory.push({
        timestamp: Date.now(),

        dome:
            appState.probes.find(
                p => p.type === "dome"
            )?.temperature ?? null,

        meat:
            appState.probes.find(
                p => p.type === "meat"
            )?.temperature ?? null
    });

    /*
        Save every 20 measurements
        to reduce writes.
    */
    if (
        session.temperatureHistory.length % 20 === 0
    ) {

        saveSessions();

        if (
            typeof saveAppState === "function"
        ) {
            saveAppState();
        }
 
    }
}


/* ==========================================================
   HELPERS
========================================================== */

function getCurrentSession() {

    if (!appState.currentSessionId) {
        return null;
    }


    return appState.sessions.find(
        s =>
            s.id === appState.currentSessionId
    );

}



function deleteCookSession(id) {

    appState.sessions =
        appState.sessions.filter(

            s => s.id !== id

        );

    saveSessions();

}



function clearAllSessions() {

    appState.sessions = [];

    saveSessions();

}



function calculateDuration(start, end) {

    const ms =
        new Date(end) -
        new Date(start);

    const minutes =
        Math.round(ms / 60000);

    const hours =
        Math.floor(minutes / 60);

    const mins =
        minutes % 60;

    return `${hours}h ${mins}m`;

}

/* ==========================================================
   APP STATE PERSISTENCE
========================================================== */

function serializeAppState() {
    return {
        cook: appState.cook,
        probes: appState.probes,
        alerts: appState.alerts,
        settings: appState.settings,
        theme: appState.theme,

        bluetooth: {
            device: appState.bluetooth.device,
            battery: appState.bluetooth.battery,
            lastUpdatedAt:
                appState.bluetooth.lastUpdatedAt
        }
    };
}

function saveAppState() {
    try {
        localStorage.setItem(
            APP_STATE_KEY,
            JSON.stringify(
                serializeAppState()
            )
        );
    }
    catch (error) {
        console.error(
            "Unable to save app state",
            error
        );
    }
}

function loadAppState() {
    try {

        const raw =
            localStorage.getItem(
                APP_STATE_KEY
            );

        if (!raw) {
            return;
        }

        const saved =
            JSON.parse(raw);

        if (saved.cook) {
            Object.assign(
                appState.cook,
                saved.cook
            );
        }

        if (saved.probes) {
            appState.probes =
                saved.probes;
        }

        if (saved.alerts) {
            appState.alerts =
                saved.alerts;
        }

        if (saved.settings) {
            appState.settings =
                saved.settings;
        }

        if (saved.theme) {
            appState.theme =
                saved.theme;
        }

        if (saved.bluetooth) {
            appState.bluetooth.battery =
                saved.bluetooth.battery ?? null;

            appState.bluetooth.device =
                saved.bluetooth.device ?? null;

            appState.bluetooth.lastUpdatedAt =
                saved.bluetooth.lastUpdatedAt ?? null;
        }

        console.log(
            "App state restored"
        );

    }
    catch (error) {
        console.error(
            "Unable to load app state",
            error
        );
    }
}

/* ==========================================================
   AUTO SAVE
========================================================== */

let saveTimeout = null;

function scheduleStateSave() {

    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(
        saveAppState,
        500
    );
}

/* ==========================================================
   LOAD ON STARTUP
========================================================== */

initializeStorage();
loadAppState();
restoreActiveCook();

function restoreActiveCook() {

    if (
        appState.cook &&
        appState.cook.active &&
        appState.cook.startedAt
    ) {

        console.log(
            "Restored active cook:",
            appState.cook.name
        );

        return true;
    }

    return false;
}