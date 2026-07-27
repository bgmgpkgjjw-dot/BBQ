/* ==========================================================
   Hermanos Grill Companion
   app.js

   Hoofdcontroller van de applicatie
   ========================================================== */


function render(){


    const app = document.getElementById("app");

    if(!app) return;


    const content = app.querySelector(".content");
    const title = app.querySelector(".topbar h1");
    const scrollTop = content?.scrollTop || 0;


    if(!app.dataset.initialized){

        app.innerHTML = `

        <div class="phone">


            <div class="notch"></div>


            <div class="topbar">

                <h1></h1>

            </div>



            <div class="content"></div>



            <div class="nav">

                <button data-screen="dashboard" onclick="navigate('dashboard')">

                    🔥<br>
                    Grill

                </button>


                <button data-screen="recipes" onclick="navigate('recipes')">

                    🍖<br>
                    Recepten

                </button>


                <button data-screen="alerts" onclick="navigate('alerts')">

                    🔔<br>
                    Meldingen

                </button>


                <button data-screen="settings" onclick="navigate('settings')">

                    ⚙️<br>
                    Instellingen

                </button>


            </div>


        </div>

        `;

        app.dataset.initialized = "true";

    }


    if(title){
        title.textContent = getTitle();
    }


    app.querySelectorAll(".nav button").forEach(button => {

        const isRecipesNav = button.getAttribute("data-screen") === "recipes";
        const isActive =
            button.getAttribute("data-screen") === appState.screen
            || (isRecipesNav && (appState.screen === "recipeDetail" || appState.screen === "recipes"));

        button.classList.toggle("active", isActive);

    });


    if(content){

        const nextHtml = renderScreen();

        if(content.innerHTML !== nextHtml){
            content.innerHTML = nextHtml;
        }

        requestAnimationFrame(() => {
            const nextContent = app.querySelector(".content");
            if(nextContent){
                nextContent.scrollTop = Math.min(scrollTop, Math.max(0, nextContent.scrollHeight - nextContent.clientHeight));
            }
        });

    }

}




function getTitle(){


    const titles = {

        dashboard:"Mijn Kamado",

        recipes:"Recepten",

        recipeDetail:"Recept",

        alerts:"Meldingen",

        settings:"Instellingen"

    };


    return titles[appState.screen];

}





function renderScreen(){


    switch(appState.screen){


        case "dashboard":

            return dashboardView();



        case "recipes":

            return recipeListView();


        case "recipeDetail":

            return recipeDetailView();



        case "alerts":

            return `

                <div class="card">

                    <h2>
                    Meldingen
                    </h2>

                    <p>
                    Geen actieve waarschuwingen.
                    </p>

                </div>

            `;



        case "settings":

            return settingsView();


    }


}






function navigate(screen){


    appState.screen = screen;

    render();

}


function rerenderPreservingScroll(){
    render();
}





if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .catch(err => console.error('Service worker registration failed:', err));
    });
}

// eerste start

render();