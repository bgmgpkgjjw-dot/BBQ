/* ==========================================================
   Hermanos Grill Companion
   app.js

   Hoofdcontroller van de applicatie
   ========================================================== */


function render(){


    const app = document.getElementById("app");


    app.innerHTML = `

    <div class="phone">


        <div class="notch"></div>


        <div class="topbar">

            <h1>
                ${getTitle()}
            </h1>

        </div>



        <div class="content">

            ${renderScreen()}

        </div>



        <div class="nav">

            <button 
            class="${appState.screen==="dashboard"?"active":""}"
            onclick="navigate('dashboard')">

                🔥<br>
                Grill

            </button>


            <button
            class="${(appState.screen==="recipes"||appState.screen==="recipeDetail")?"active":""}"
            onclick="navigate('recipes')">

                🍖<br>
                Recepten

            </button>


            <button
            class="${appState.screen==="alerts"?"active":""}"
            onclick="navigate('alerts')">

                🔔<br>
                Meldingen

            </button>


            <button
            class="${appState.screen==="settings"?"active":""}"
            onclick="navigate('settings')">

                ⚙️<br>
                Instellingen

            </button>


        </div>


    </div>

    `;

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





// eerste start

render();