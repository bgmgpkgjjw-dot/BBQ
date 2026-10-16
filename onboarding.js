/* ==========================================================
   Hermanos Grill Companion
   onboarding.js

   First-run welcome screen: try the demo, connect a Raspberry Pi,
   or skip and use Bluetooth.
   ========================================================== */

let onboardingError = "";

function escapeOnboardingAttr(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
}

function onboardingView() {
    return `
        <div class="card">
            <h2>Welcome to Hermanos BBQ</h2>
            <p style="color:var(--muted)">
                Monitor your grill temperatures, get cook forecasts and keep a history of every cook.
                Choose how you want to start.
            </p>
        </div>

        <div class="card">
            <h2>Try the demo</h2>
            <p style="color:var(--muted)">
                A simulated cook, no hardware needed. You can switch it off anytime in Settings.
            </p>
            <button class="button" onclick="finishOnboarding('demo')">Start demo</button>
        </div>

        <div class="card">
            <h2>Connect to my Raspberry Pi</h2>
            <p style="color:var(--muted)">
                Enter the address and API token shown at the end of the installer.
            </p>

            <label>Server Address</label>
            <input
                id="onboarding-address"
                type="text"
                value="${escapeOnboardingAttr(appState.network.serverAddress)}"
                placeholder="raspberrypi.local"
                autocapitalize="off"
                autocorrect="off"
            >

            <label>API Token</label>
            <input
                id="onboarding-token"
                type="password"
                value="${escapeOnboardingAttr(appState.network.apiToken)}"
                placeholder="Token from the installer"
            >

            ${onboardingError ? `<p class="bluetooth-error">${onboardingError}</p>` : ""}

            <button class="button" onclick="finishOnboarding('pi')">Connect</button>
        </div>

        <div class="card">
            <h2>Use Bluetooth directly</h2>
            <p style="color:var(--muted)">
                Skip setup and connect a thermometer from Settings later.
            </p>
            <button class="button secondary" onclick="finishOnboarding('bluetooth')">Skip for now</button>
        </div>
    `;
}

function showOnboarding() {
    onboardingError = "";
    appState.screen = "welcome";
    render();
}

function finishOnboarding(choice) {
    if (choice === "pi") {
        const address = (document.getElementById("onboarding-address")?.value || "").trim();
        const token = (document.getElementById("onboarding-token")?.value || "").trim();

        if (!address) {
            onboardingError = "Enter the server address of your Raspberry Pi.";
            render();
            return;
        }

        onboardingError = "";
        appState.network.apiToken = token;
        setNetworkSocketEnabled(true, address);
    }

    appState.settings.onboardingDone = true;
    appState.screen = choice === "bluetooth" ? "settings" : "dashboard";
    saveAppState();

    if (choice === "demo") {
        startSimulator();
    }

    render();
}

window.showOnboarding = showOnboarding;
window.finishOnboarding = finishOnboarding;

if (!appState.settings.onboardingDone) {
    appState.screen = "welcome";
}
