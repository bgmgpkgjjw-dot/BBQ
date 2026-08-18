/* ==========================================================
   Hermanos Grill Companion

   storage.js

   Local cook storage
   ========================================================== */

const STORAGE_KEY = "hermanos_grill_sessions_v1";
const APP_STATE_KEY = "hermanos_grill_app_state_v1";
const COOK_STORAGE_PORT = 8090;
const HISTORY_SAMPLE_INTERVALS = [
    { afterMs: 0, intervalMs: 10 * 1000 },
    { afterMs: 15 * 60 * 1000, intervalMs: 30 * 1000 },
    { afterMs: 2 * 60 * 60 * 1000, intervalMs: 60 * 1000 },
    { afterMs: 8 * 60 * 60 * 1000, intervalMs: 5 * 60 * 1000 }
];
const DOME_OPENING_DROP = 15;
const DOME_OPENING_RECOVERY = 8;
const DOME_OPENING_MAX_DURATION = 10 * 60 * 1000;
const historyRuntime = new Map();
const DEVICE_ID_KEY = "hermanos_device_id";

function getDeviceId() {
    try {
        let deviceId = localStorage.getItem(DEVICE_ID_KEY);
        if (!deviceId) {
            deviceId = (crypto.randomUUID && crypto.randomUUID()) ||
                `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            localStorage.setItem(DEVICE_ID_KEY, deviceId);
        }
        return deviceId;
    } catch (error) {
        return "unknown-device";
    }
}

function getCookStorageUrl() {
    const address = appState.network?.serverAddress;
    if (!address) {
        return null;
    }

    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    return `${protocol}//${address}:${COOK_STORAGE_PORT}/api/cook-sessions`;
}

function getTemperatureLogUrl() {
    const cookStorageUrl = getCookStorageUrl();
    if (!cookStorageUrl) {
        return null;
    }
    return cookStorageUrl.replace("/api/cook-sessions", "/api/temperature-log");
}

function getCookStorageHeaders(extra = {}) {
    const headers = { "X-BBQ-Device-Id": getDeviceId(), ...extra };
    const apiToken = appState.network?.apiToken;
    if (apiToken) {
        headers["X-BBQ-Token"] = apiToken;
    }
    return headers;
}

function mergeBackfilledReadings(session, readings) {
    if (!Array.isArray(session.temperatureHistory)) {
        session.temperatureHistory = [];
    }

    const existingTimestamps = new Set(session.temperatureHistory.map(sample => sample.timestamp));

    readings
        .filter(reading => !existingTimestamps.has(reading.timestamp))
        .sort((a, b) => a.timestamp - b.timestamp)
        .forEach(reading => {
            const dome = reading.dome != null ? reading.dome / 10 : null;
            const meat = reading.probe1 != null ? reading.probe1 / 10 : null;
            const prepared = prepareHistoricalTemperature(session, dome, meat, reading.timestamp);

            if (shouldRecordHistoricalSample(session, prepared, reading.timestamp)) {
                const sample = { timestamp: reading.timestamp, dome: prepared.dome, meat: prepared.meat };
                if (prepared.domeRaw !== undefined) {
                    sample.domeRaw = prepared.domeRaw;
                    sample.domeEvent = prepared.domeEvent;
                }
                session.temperatureHistory.push(sample);
            }
        });

    session.temperatureHistory.sort((a, b) => a.timestamp - b.timestamp);
}

async function backfillActiveSessionFromPi() {
    const session = getCurrentSession();
    if (!session || session.finishedAt) {
        return;
    }

    const url = getTemperatureLogUrl();
    if (!url) {
        return;
    }

    try {
        const since = encodeURIComponent(session.startedAt);
        const response = await fetch(`${url}?since=${since}`, {
            headers: getCookStorageHeaders()
        });

        if (!response.ok) {
            throw new Error(`Pi storage returned ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data.readings) || !data.readings.length) {
            return;
        }

        mergeBackfilledReadings(session, data.readings);
        saveSessions();
        render();
    } catch (error) {
        console.warn("Unable to backfill temperature history from Pi", error);
    }
}

function getHistoryRuntime(session) {
    if (!historyRuntime.has(session.id)) {
        historyRuntime.set(session.id, {
            lastRawDome: null,
            stableDome: null,
            transientUntil: 0,
            domeOpening: false
        });
    }

    return historyRuntime.get(session.id);
}

function getHistorySampleInterval(session, timestamp) {
    const startedAt = Date.parse(session.startedAt);
    const elapsed = Number.isNaN(startedAt)
        ? 0
        : Math.max(0, timestamp - startedAt);

    return HISTORY_SAMPLE_INTERVALS.reduce(
        (interval, candidate) => elapsed >= candidate.afterMs
            ? candidate.intervalMs
            : interval,
        HISTORY_SAMPLE_INTERVALS[0].intervalMs
    );
}

function isSignificantTemperatureChange(previous, current) {
    if (!previous || current == null) {
        return false;
    }

    return (
        previous.dome != null &&
        current.dome != null &&
        Math.abs(current.dome - previous.dome) >= 3
    ) || (
        previous.meat != null &&
        current.meat != null &&
        Math.abs(current.meat - previous.meat) >= 0.5
    );
}

function prepareHistoricalTemperature(session, dome, meat, timestamp) {
    const runtime = getHistoryRuntime(session);
    const previousRawDome = runtime.lastRawDome;
    const previousStableDome = runtime.stableDome ?? dome;

    if (
        previousRawDome != null &&
        dome != null &&
        previousRawDome - dome >= DOME_OPENING_DROP
    ) {
        runtime.domeOpening = true;
        runtime.transientUntil = timestamp + DOME_OPENING_MAX_DURATION;
        runtime.stableDome = previousStableDome;
    }

    runtime.lastRawDome = dome;

    if (runtime.domeOpening) {
        const recovered = dome != null &&
            Math.abs(dome - (runtime.stableDome ?? dome)) <= DOME_OPENING_RECOVERY;

        if (recovered || timestamp >= runtime.transientUntil) {
            runtime.domeOpening = false;
            runtime.transientUntil = 0;
            runtime.stableDome = dome;
        }
    } else if (dome != null) {
        runtime.stableDome = dome;
    }

    return {
        dome: runtime.domeOpening ? runtime.stableDome : dome,
        meat,
        domeRaw: runtime.domeOpening ? dome : undefined,
        domeEvent: runtime.domeOpening ? "opening" : undefined
    };
}

function shouldRecordHistoricalSample(session, sample, timestamp) {
    const previous = session.temperatureHistory.at(-1);
    if (!previous) {
        return true;
    }

    const interval = getHistorySampleInterval(session, timestamp);
    const intervalElapsed = timestamp - previous.timestamp >= interval;
    const significantChange = isSignificantTemperatureChange(previous, sample);

    return intervalElapsed || significantChange;
}


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

        syncSessionsToPi();

    }
    catch (error) {

        console.error(
            "Unable to save sessions",
            error
        );

    }

}

async function syncSessionsToPi() {
    const url = getCookStorageUrl();
    if (!url) {
        return;
    }

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: getCookStorageHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ sessions: appState.sessions })
        });

        if (!response.ok) {
            throw new Error(`Pi storage returned ${response.status}`);
        }
    }
    catch (error) {
        console.warn("Pi cook backup unavailable; local copy retained", error);
    }
}

async function syncSessionsFromPi() {
    const url = getCookStorageUrl();
    if (!url) {
        return;
    }

    try {
        const response = await fetch(url, { headers: getCookStorageHeaders() });
        if (!response.ok) {
            throw new Error(`Pi storage returned ${response.status}`);
        }

        const remote = await response.json();
        if (!Array.isArray(remote.sessions)) {
            return;
        }

        const merged = new Map(
            appState.sessions.map(session => [session.id, session])
        );

        remote.sessions.forEach(session => {
            const local = merged.get(session.id);
            if (!local || new Date(session.updatedAt || session.finishedAt || session.startedAt) >
                new Date(local.updatedAt || local.finishedAt || local.startedAt)) {
                merged.set(session.id, session);
            }
        });

        appState.sessions = Array.from(merged.values())
            .sort((left, right) => new Date(right.startedAt) - new Date(left.startedAt));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.sessions));
        render();
        await syncSessionsToPi();
    }
    catch (error) {
        console.warn("Pi cook backup unavailable; local copy retained", error);
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
            "New cook",

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
    if (
        typeof saveAppState ===
        "function"
    ) {
        saveAppState();
    }


    appState.sessions.unshift(
        session
    );


    saveSessions();

}


/* ==========================================================
   FINISH SESSION
========================================================== */

function finishCookSession() {

    let session =
        getCurrentSession();

    if (
        !session &&
        appState.sessions?.length
    ) {

        session =
            appState.sessions.find(
                s => !s.finishedAt
            );
    }

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

    if (
        typeof saveAppState ===
        "function"
    ) {
        saveAppState();
    }

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

    const timestamp = Date.now();
    const dome = appState.probes.find(p => p.type === "dome")?.temperature ?? null;
    const meat = appState.probes.find(p => p.type === "meat")?.temperature ?? null;
    const prepared = prepareHistoricalTemperature(session, dome, meat, timestamp);

    if (!shouldRecordHistoricalSample(session, prepared, timestamp)) {
        return;
    }

    const sample = {
        timestamp,
        dome: prepared.dome,
        meat: prepared.meat
    };

    if (prepared.domeRaw !== undefined) {
        sample.domeRaw = prepared.domeRaw;
        sample.domeEvent = prepared.domeEvent;
    }

    session.temperatureHistory.push(sample);

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
        currentSessionId: appState.currentSessionId,
        settings: appState.settings,
        theme: appState.theme,
        ai: appState.ai,
        network: appState.network,

        bluetooth: {
            device: appState.bluetooth.device,
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

        if (saved.currentSessionId) {
            appState.currentSessionId =
                saved.currentSessionId;
        }

        if (saved.settings) {
            appState.settings =
                saved.settings;
        }

        if (saved.theme) {
            appState.theme =
                saved.theme;
        }

        if(saved.ai){
            appState.ai = saved.ai;
        }

        if(saved.network){
            appState.network = saved.network;
        }

        if (saved.bluetooth) {
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
syncSessionsFromPi();

// Initialize network socket if enabled
if (appState.network && appState.network.enabled && appState.network.serverAddress) {
    setTimeout(() => {
        if (typeof initNetworkSocket === 'function') {
            initNetworkSocket(appState.network.serverAddress);
            appState.network.enabled = true;
            saveAppState();
        }
    }, 500);
}

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