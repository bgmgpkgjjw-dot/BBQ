/* ==========================================================
   Hermanos Grill Companion

   history.js

   Temperature history + graphs
   ========================================================== */


let temperatureChart = null;




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


        timestamp:
            Date.now(),


        elapsed:

            Math.floor(
                (
                    Date.now()
                    -
                    new Date(
                        appState.history.activeSession.startedAt
                    ).getTime()

                ) / 60000
            ),



        dome:

            appState.probes
            .find(
                p=>p.type==="dome"
            )
            ?.temperature || null,



        meat:

            appState.probes
            .find(
                p=>p.type==="meat"
            )
            ?.temperature || null


    };




    appState.history.activeSession.samples.push(sample);



    // max 6 hours of samples
    if(
        appState.history.activeSession.samples.length > 720
    ){

        appState.history.activeSession.samples.shift();

    }


}







function finishCookHistory(){


    const session =
        appState.history.activeSession;



    if(
        !session.samples.length
    ){
        return;
    }




    appState.history.sessions.push({

        id:
            Date.now(),


        name:
            appState.cook.name,


        startedAt:
            session.startedAt,


        finishedAt:
            new Date().toISOString(),


        samples:
            session.samples


    });




    appState.history.activeSession = {

        startedAt:null,

        samples:[]

    };


}








function historyView(){


return `


<div class="card">


<h2>
📈 Temperatuur verloop
</h2>


<div class="chart-container">

<canvas id="temperatureChart"></canvas>

</div>


</div>




<div class="card">


<h3>
Cook historie
</h3>



${
appState.history.sessions.length

?

appState.history.sessions
.map(
s=>`

<div class="recipe">

<h2>
${s.name}
</h2>

<p>
${new Date(s.finishedAt)
.toLocaleString()}
</p>


</div>


`
)
.join("")

:

`
<p style="color:var(--muted)">
Nog geen afgeronde cooks.
</p>
`

}


</div>


`;

}









function renderTemperatureChart(){


const canvas =
document.getElementById(
"temperatureChart"
);



if(!canvas){
    return;
}



const samples =
appState.history.activeSession.samples;



if(!samples.length){
    return;
}






if(temperatureChart){

    temperatureChart.destroy();

}






temperatureChart =
new Chart(
canvas,
{


type:"line",



data:{


labels:

samples.map(
s=>`${s.elapsed} min`
),



datasets:[

{


label:"🔥 Dome",

data:

samples.map(
s=>s.dome
),



tension:.3

},



{


label:"🥩 Vlees",

data:

samples.map(
s=>s.meat
),



tension:.3

}


]


},



options:{


responsive:true,


interaction:{

mode:"index",

intersect:false

},


scales:{


y:{

beginAtZero:false

}


}


}


}

);


}
