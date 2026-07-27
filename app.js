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