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

    console.log("Notification permission:", Notification.permission);
}

async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        appState.settings.notifications = false;
        saveAppState();
        render();
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        appState.settings.notifications = permission === "granted";
        saveAppState();
        render();
        return permission === "granted";
    }
    catch (error) {
        console.warn("Notification permission request failed", error);
        appState.settings.notifications = false;
        saveAppState();
        render();
        return false;
    }
}

function sendNotification(
    title,
    body,
    tag = "general"
) {

    if (!appState.settings.notifications) {
        return;
    }

    if (!("Notification" in window) || Notification.permission !== "granted") {
        console.warn("Notification skipped: permission is not granted");
        return;
    }

    if (typeof recordAlert === "function") {
        recordAlert(tag, body);
    }

    try {
        new Notification(title, {
            body,
            tag,
            requireInteraction: true
        });
    }
    catch (error) {
        console.warn("Notification could not be shown", error);
        return;
    }

    if (appState.settings.notificationSound) {
        playAlertSound();
    }

    if (appState.settings.notificationHaptics) {
        triggerVibration();
    }
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
    checkApproachingMeatTarget(meat);
    checkDomeDeviation(dome);
    checkApproachingDomeTarget(dome);
    checkBluetoothAlert();
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
                    "Probe offline",
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
            "Target reached",
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
                "Dome too hot",
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
                "Dome too cold",
                `${Math.round(dome.temperature)}°C`
            );
        }
    }
}
``

function checkBluetoothAlert() {

    if (appState.network.enabled) {
        return;
    }

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
            "Bluetooth disconnected",
            "Thermometer connection lost."
        );
    }
}

function playAlertSound() {
    try {
        const audioContext = 
            new (window.AudioContext || window.webkitAudioContext)();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01, 
            audioContext.currentTime + 0.3
        );
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log("Audio not available");
    }
}

function triggerVibration() {
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

function checkApproachingMeatTarget(meat) {
    if (
        !meat ||
        meat.temperature == null
    ) {
        return;
    }

    const target = appState.cook.meatTarget;

    if (!target) {
        return;
    }

    const threshold = 
        appState.alerts.approachingThreshold;

    const key = "meat-approaching";

    if (
        meat.temperature >= target - threshold &&
        meat.temperature < target &&
        !alertState.fired.has(key)
    ) {
        alertState.fired.add(key);

        sendNotification(
            "Core approaching target",
            `${meat.name} at ${Math.round(meat.temperature)}°C, target is ${target}°C`,
            key
        );
    }
}

function checkApproachingDomeTarget(dome) {
    if (
        !dome ||
        dome.temperature == null
    ) {
        return;
    }

    const target = appState.cook.domeTarget;

    if (!target) {
        return;
    }

    const threshold = 
        appState.alerts.approachingThreshold;

    const key = "dome-approaching";

    if (
        dome.temperature >= target - threshold &&
        dome.temperature < target &&
        !alertState.fired.has(key)
    ) {
        alertState.fired.add(key);

        sendNotification(
            "Dome approaching target",
            `${Math.round(dome.temperature)}°C, target is ${target}°C`,
            key
        );
    }
}