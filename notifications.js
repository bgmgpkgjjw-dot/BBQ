/* ==========================================================
   Hermanos Grill Companion
   notifications.js
========================================================== */

const alertState = {
    fired: new Set(),
    cooldowns: {}
};

function initializeNotifications() {

    if (!("Notification" in window)) {
        console.warn(
            "Notifications not supported"
        );
        return;
    }

    if (Notification.permission === "default") {
        Notification.requestPermission();
    }
}

function sendNotification(
    title,
    body,
    tag = "general"
) {

    function recordAlert(type, message){

    appState.alerts.history.unshift({
        type,
        message,
        timestamp: new Date().toISOString()
    });

    if(appState.alerts.history.length > 100){
        appState.alerts.history.pop();
    }

    if(typeof saveAppState === "function"){
        saveAppState();
    }
    }

    new Notification(title, {
        body,
        tag,
        requireInteraction: true
    });
}

function shouldTriggerAlert(
    key,
    cooldownMinutes = 10
) {

    const now = Date.now();

    if (
        !alertState.cooldowns[key]
    ) {
        alertState.cooldowns[key] = now;
        return true;
    }

    const elapsed =
        now - alertState.cooldowns[key];

    if (
        elapsed >
        cooldownMinutes *
        60 *
        1000
    ) {
        alertState.cooldowns[key] = now;
        return true;
    }

    return false;
}
function checkAlerts() {

    if (
        !appState.alerts.enabled
    ) {
        return;
    }

    const dome =
        appState.probes.find(
            p => p.type === "dome"
        );

    const meat =
        appState.probes.find(
            p => p.type === "meat"
        );

    checkMeatTarget(meat);
    checkDomeDeviation(dome);
    checkBluetoothAlert();
    checkBatteryAlert();
    checkProbeHealth();
}

function checkProbeHealth(){

    appState.probes.forEach(probe => {

        if(
            !probe.active ||
            !probe.lastSeen
        ){
            return;
        }

        const seconds =
            (Date.now() - probe.lastSeen) / 1000;

        if(seconds > 60){

            if(
                shouldTriggerAlert(
                    `probe-${probe.id}-offline`,
                    15
                )
            ){

                sendNotification(
                    "⚠ Probe Offline",
                    `${probe.name} stopped updating`,
                    `probe-${probe.id}`
                );
            }
        }
    });
}

function checkMeatTarget(meat) {

    if (
        !meat ||
        meat.temperature == null
    ) {
        return;
    }

    const target =
        appState.cook.meatTarget;

    if (!target) {
        return;
    }

    const key =
        "meat-target";

    if (
        meat.temperature >= target &&
        !alertState.fired.has(key)
    ) {

        alertState.fired.add(key);

        sendNotification(
            "🥩 Target reached",
            `${meat.name} reached ${Math.round(meat.temperature)}°C`,
            key
        );
    }
}

function checkDomeDeviation(
    dome
) {

    if (
        !dome ||
        dome.temperature == null
    ) {
        return;
    }

    const target =
        appState.cook.domeTarget;

    if (!target) {
        return;
    }

    const limit =
        appState.alerts.domeDeviation;

    if (
        dome.temperature >
        target + limit
    ) {

        if (
            shouldTriggerAlert(
                "dome-high",
                15
            )
        ) {

            sendNotification(
                "🔥 Dome too hot",
                `${Math.round(dome.temperature)}°C`
            );
        }
    }

    if (
        dome.temperature <
        target - limit
    ) {

        if (
            shouldTriggerAlert(
                "dome-low",
                15
            )
        ) {

            sendNotification(
                "❄ Dome too cold",
                `${Math.round(dome.temperature)}°C`
            );
        }
    }
}
``

function checkBluetoothAlert() {

    if (
        appState.bluetooth.connected
    ) {
        return;
    }

    if (
        shouldTriggerAlert(
            "bluetooth-disconnect",
            30
        )
    ) {

        sendNotification(
            "⚠ Bluetooth disconnected",
            "Thermometer connection lost."
        );
    }
}

function checkBatteryAlert(){

    const battery =
        appState.bluetooth.battery;

    if(
        battery === null ||
        battery === undefined
    ){
        return;
    }

    if(
        battery <= 15 &&
        shouldTriggerAlert(
            "battery-low",
            60
        )
    ){

        sendNotification(
            "🔋 Low Battery",
            `Thermometer battery is ${battery}%`,
            "battery-low"
        );
    }
}