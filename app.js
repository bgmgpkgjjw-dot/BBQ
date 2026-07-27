/* ==========================================================
   Hermanos Grill Companion

   app.js

   Main application controller
   ========================================================== */



function render() {


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

    <button data-screen="dashboard" onclick="navigate('dashboard')" aria-label="Cook">

        <svg viewBox="0 0 24 24" class="nav-icon">
            <path d="M12 2C10 5 7 8 7 12a5 5 0 0 0 10 0c0-2.6-1.5-4.6-3-6.7-.8-1.1-1.5-2.2-2-3.3z"/>
        </svg>

    </button>

    <button data-screen="recipes" onclick="navigate('recipes')" aria-label="Recipes">

        <svg viewBox="0 0 24 24" class="nav-icon">
            <path d="M5 3h11a3 3 0 0 1 3 3v15H8a3 3 0 0 0-3-3V3z"/>
            <path d="M8 3v15"/>
        </svg>

    </button>

    <button data-screen="history" onclick="navigate('history')" aria-label="History">

        <svg viewBox="0 0 24 24" class="nav-icon">
            <polyline points="4,16 9,11 13,14 20,7"/>
            <line x1="4" y1="20" x2="20" y2="20"/>
        </svg>

    </button>

    <button data-screen="settings" onclick="navigate('settings')" aria-label="Settings">

        <svg viewBox="0 0 24 24" class="nav-icon">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z"/>
        </svg>

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


        dashboard:
            "Mijn Kamado",


        recipes:
            "Recepten",


        recipeDetail:
            "Recept",


        history:
            "Geschiedenis",


        settings:
            "Instellingen"


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


        case "history":

            setTimeout(
                renderTemperatureChart,
                50
            );

            if (appState.selectedHistory) {

                return historyDetailView();
            }
            return historyView();


        case "settings":

            return settingsView();




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

render();