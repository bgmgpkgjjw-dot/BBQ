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

/* ----------------------------------------------------------
   Pairing link: https://<pi>:3000/#pair=<address>|<token>
   The fragment is never sent to a server, and is removed from the
   address bar once read.
---------------------------------------------------------- */

function readPairingFromHash() {
    const match = window.location.hash.match(/^#pair=(.+)$/);
    if (!match) {
        return null;
    }

    let decoded;
    try {
        decoded = decodeURIComponent(match[1]);
    } catch (error) {
        return null;
    }

    const separator = decoded.indexOf("|");
    const address = (separator === -1 ? decoded : decoded.slice(0, separator)).trim();
    const token = separator === -1 ? "" : decoded.slice(separator + 1).trim();

    // Hostname or IPv4 only, so a crafted link cannot smuggle in a path or port.
    if (!/^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(address)) {
        return null;
    }

    return { address, token };
}

async function applyPairingFromHash() {
    const pairing = readPairingFromHash();

    if (window.location.hash.startsWith("#pair=")) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    if (!pairing) {
        return;
    }

    const confirmed = await uiConfirm(
        "Pair with grill server?",
        `Connect this app to ${pairing.address} and save its access token? Only continue if you scanned this from your own Raspberry Pi.`,
        { confirmText: "Pair" }
    );

    if (!confirmed) {
        return;
    }

    appState.network.apiToken = pairing.token;
    appState.settings.onboardingDone = true;
    setNetworkSocketEnabled(true, pairing.address);
    appState.screen = "dashboard";
    saveAppState();
    render();
}

window.addEventListener("load", applyPairingFromHash);

window.showOnboarding = showOnboarding;
window.finishOnboarding = finishOnboarding;

if (!appState.settings.onboardingDone) {
    appState.screen = "welcome";
}
