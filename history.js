/* ==========================================================
   Hermanos Grill Companion

   history.js

   Temperature history and cook sessions
   ========================================================== */



function recordTemperatureHistory(){


    if(!appState.cook.active){
        return;
    }



    if(!appState.history){
        return;
    }




    if(!appState.history.activeSession.startedAt){

        appState.history.activeSession.startedAt =
            new Date().toISOString();

    }




    const sample = {


        time:
            new Date().toISOString(),


        probes:
            appState.probes
            .filter(p=>p.active)
            .map(p=>({

                id:p.id,

                name:p.name,

                temperature:p.temperature

            }))

    };




    appState.history.activeSession.samples.push(sample);




    // limit memory usage
    if(
        appState.history.activeSession.samples.length > 5000
    ){

        appState.history.activeSession.samples.shift();

    }


}






function finishCookHistory(){


    if(
        !appState.history.activeSession.samples.length
    ){

        return;

    }




    appState.history.sessions.push({

        startedAt:
            appState.history.activeSession.startedAt,


        finishedAt:
            new Date().toISOString(),


        samples:
            appState.history.activeSession.samples


    });




    appState.history.activeSession = {

        startedAt:null,

        samples:[]

    };


}







function historyView(){


    const session =
        appState.history.activeSession;



    return `


    <div class="card">


        <h2>
        Temperatuur historie
        </h2>


        <p>
        Live temperatuurmetingen tijdens cooks.
        </p>


    </div>




    <div class="card">


        <h3>
        Huidige cook
        </h3>



        ${
            session.samples.length

            ?

            `

            <p>
            Metingen:
            <strong>
            ${session.samples.length}
            </strong>
            </p>


            <div class="history-placeholder">

                📈 Grafiek komt hier

            </div>


            `

            :

            `

            <p style="color:var(--muted)">
            Nog geen temperatuurdata.
            </p>

            `

        }


    </div>


    `;

}