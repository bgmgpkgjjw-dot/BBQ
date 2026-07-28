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

    if (
        !appState.settings.notifications
    ) {
        return;
    }

    if (
        Notification.permission !==
        "granted"
    ) {
        return;
    }

    new Notification(title, {
        body,
        tag,
        silent: false
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