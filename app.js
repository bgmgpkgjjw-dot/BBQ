/* ==========================================================
   Hermanos Grill Companion

   app.js

   Main application controller
   ========================================================== */



function render() {

    if (typeof syncWakeLockState === "function") {
        syncWakeLockState();
    }

    const app =
        document.getElementById("app");


    if (!app) return;



    let content =
        app.querySelector(".content");


    let title =
        app.querySelector(".topbar h1");



    const scrollTop =
        content?.scrollTop || 0;





    if (!app.dataset.initialized) {


        app.innerHTML = `


        <div class="phone">


            <div class="topbar">

                <h1></h1>

            </div>



            <div class="content"></div>



    <div class="nav">

    <button
        data-screen="dashboard"
        onclick="navigate('dashboard')"
        aria-label="Cook">

        ${Icons.cook}

    </button>

    <button
        data-screen="recipes"
        onclick="navigate('recipes')"
        aria-label="Recipes">

        ${Icons.recipes}

    </button>

    <button
        data-screen="history"
        onclick="navigate('history')"
        aria-label="History">

        ${Icons.history}

    </button>

    <button
        data-screen="settings"
        onclick="navigate('settings')"
        aria-label="Settings">

        ${Icons.settings}

    </button>

</div>


        </div>


        `;


        app.dataset.initialized =
            "true";


        content =
            app.querySelector(".content");


        title =
            app.querySelector(".topbar h1");


    }








    if (title) {

        title.textContent =
            getTitle();

    }








    app
        .querySelectorAll(".nav button")
        .forEach(button => {


            const screen =
                button.dataset.screen;



            button.classList.toggle(

                "active",

                screen === appState.screen

                ||

                (
                    screen === "recipes"

                    &&

                    appState.screen === "recipeDetail"
                )

            );


        });







    if (content) {


        const html =
            renderScreen();



        if (content.innerHTML !== html) {

            content.innerHTML =
                html;

        }




        requestAnimationFrame(() => {


            const next =
                app.querySelector(
                    ".content"
                );


            if (next) {

                next.scrollTop =
                    Math.min(
                        scrollTop,
                        Math.max(
                            0,
                            next.scrollHeight -
                            next.clientHeight
                        )
                    );

            }


        });


    }


}










function getTitle() {


    const titles = {

        dashboard: "My Kamado",

        recipes: "Recipes",

        recipeDetail: "Recipe",

        history: "History",

        settings: "Settings",

        ai: "AI Assistant",

    };


    return titles[
        appState.screen
    ] || "Hermanos";

}









function renderScreen() {


    switch (appState.screen) {
        
        case "dashboard":

            return dashboardView();

        case "recipes":

            return recipeListView();
        
        case "recipeDetail":

            return recipeDetailView();

        case "ai":
            return aiAssistantView();
        
        case "history":

            if (appState.selectedHistory) {

                return historyDetailView();
            }
            return historyView();


        case "settings":

            return settingsView();

        case "aiRecipe":
            return aiRecipeDetailView();
        
        default:

            return dashboardView();
            
    }


}










function navigate(screen) {


    appState.screen =
        screen;


    render();


}










function rerenderPreservingScroll() {


    render();


}










if (
    "serviceWorker" in navigator
) {


    window.addEventListener(
        "load",
        () => {


            navigator.serviceWorker
                .register("./sw.js")


                .then(
                    registration =>
                        registration.update()
                )


                .catch(
                    err =>
                        console.error(
                            "Service worker registration failed:",
                            err
                        )
                );


        }
    );


}







// start app

if (
    typeof initializeNotifications ===
    "function"
) {
    initializeNotifications();
}

if (typeof applyTheme === "function") {
    applyTheme(appState.theme?.preset || "default");
}

render();

// ====================================================================
// WAKE LOCK
// ====================================================================

let wakeLock = null;
let safariAudioWakeLock = null;

function supportsWakeLock() {
    return typeof navigator !== "undefined" && "wakeLock" in navigator;
}

function supportsSafariAudioWakeLock() {
    return typeof window !== "undefined" &&
        ("AudioContext" in window || "webkitAudioContext" in window);
}

function getWakeLockStatusText() {
    if (supportsWakeLock()) {
        return "Wake Lock available";
    }

    if (supportsSafariAudioWakeLock()) {
        return "Safari-compatible fallback enabled";
    }

    return "Wake Lock unavailable in this browser; the phone will sleep normally";
}

async function requestSafariAudioWakeLock() {
    if (!supportsSafariAudioWakeLock()) {
        return;
    }

    try {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;

        if (!safariAudioWakeLock) {
            safariAudioWakeLock = new AudioCtor();

            const oscillator = safariAudioWakeLock.createOscillator();
            const gainNode = safariAudioWakeLock.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = 220;
            gainNode.gain.value = 0.0001;

            oscillator.connect(gainNode);
            gainNode.connect(safariAudioWakeLock.destination);
            oscillator.start();

            safariAudioWakeLock.__bbqOscillator = oscillator;
            safariAudioWakeLock.__bbqGain = gainNode;
        }

        if (safariAudioWakeLock.state === "suspended") {
            await safariAudioWakeLock.resume();
        }

        console.log("Safari audio wake lock enabled");
    }
    catch (error) {
        console.warn("Safari audio wake lock failed", error);
    }
}

async function releaseSafariAudioWakeLock() {
    try {
        if (safariAudioWakeLock) {
            const oscillator = safariAudioWakeLock.__bbqOscillator;
            if (oscillator) {
                try {
                    oscillator.stop();
                }
                catch (error) {
                    console.warn("Safari oscillator stop failed", error);
                }
            }

            await safariAudioWakeLock.close();
            safariAudioWakeLock = null;
            console.log("Safari audio wake lock released");
        }
    }
    catch (error) {
        console.error(error);
    }
}

async function requestWakeLock() {

    if (!appState?.cook?.active || !appState?.settings?.keepScreenAwake) {
        return;
    }

    if (supportsWakeLock()) {
        try {
            if (wakeLock) {
                return;
            }

            wakeLock = await navigator.wakeLock.request("screen");
            console.log("Wake lock enabled");
            return;
        }
        catch (error) {
            console.error("Wake lock failed", error);
        }
    }

    await requestSafariAudioWakeLock();
}

async function releaseWakeLock() {

    try {

        if (wakeLock) {
            await wakeLock.release();
            wakeLock = null;
            console.log("Wake lock released");
        }

    }
    catch (error) {
        console.error(error);
    }

    await releaseSafariAudioWakeLock();
}

async function syncWakeLockState() {

    if (!appState) {
        return;
    }

    if (
        appState.cook?.active &&
        appState.settings?.keepScreenAwake
    ) {
        await requestWakeLock();
        return;
    }

    await releaseWakeLock();
}

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        syncWakeLockState();
    }
});
