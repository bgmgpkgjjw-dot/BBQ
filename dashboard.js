/* ==========================================================
   Hermanos Grill Companion

   dashboard.js

   Premium BBQ dashboard
   ========================================================== */



function formatTemperatureValue(value){

    if(
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ){
        return "—";
    }

    return `${Math.round(Number(value))}°`;

}





function getProbeTarget(probe){

    if(!appState.cook){
        return null;
    }


    if(probe.type === "dome"){
        return appState.cook.domeTarget || null;
    }


    if(probe.type === "meat"){
        return appState.cook.meatTarget || null;
    }


    return null;

}





function getProgress(probe){

    const target = getProbeTarget(probe);


    if(!target || !probe.temperature){
        return 0;
    }


    return Math.min(
        100,
        Math.round(
            probe.temperature / target * 100
        )
    );

}





function getProbeStatus(probe){

    const target = getProbeTarget(probe);

    const temp = Number(probe.temperature);


    if(!temp){
        return "";
    }


    if(target && temp >= target){
        return "ready";
    }


    if(temp >= 70){
        return "hot";
    }


    return "warming";

}





function updateLiveUi(){


    const status =
        document.querySelector(
            "[data-live-status]"
        );


    if(status){

        status.textContent =
            appState.bluetooth.connected

            ?

            `🟢 ${appState.bluetooth.device || "Bluetooth"}`

            :

            "🔴 Niet verbonden";

    }




    document
    .querySelectorAll("[data-probe-temperature]")
    .forEach(el=>{


        const id =
            Number(el.dataset.probeId);


        const probe =
            appState.probes.find(
                p=>p.id===id
            );


        if(probe){

            el.textContent =
                formatTemperatureValue(
                    probe.temperature
                );

        }

    });

}







function renderProbeCard(probe){


    const target = getProbeTarget(probe);

    const progress = getProgress(probe);


    return `


<div class="probe-card ${getProbeStatus(probe)}">


    <div class="probe-title">

        <span>
            ${probe.type==="meat" ? "🥩":"🔥"}
            ${probe.name}
        </span>


        <span class="probe-id">
            P${probe.id}
        </span>

    </div>




    <div
    class="probe-temperature"
    data-probe-temperature
    data-probe-id="${probe.id}"
    >

        ${formatTemperatureValue(probe.temperature)}

    </div>




    <div class="probe-info">

        ${
            target
            ?
            `Doel ${target}°C`
            :
            "Geen doel"
        }

    </div>




    <div class="progress-bar">

        <div
        class="progress-value"
        style="width:${progress}%">
        </div>

    </div>


</div>


`;

}








function formatElapsedTime(){


    if(!appState.cook.startedAt){
        return "00:00";
    }


    const start =
        new Date(appState.cook.startedAt);


    const seconds =
        Math.floor(
            (Date.now()-start.getTime()) / 1000
        );


    const hours =
        Math.floor(seconds/3600);


    const minutes =
        Math.floor(
            (seconds%3600)/60
        );


    return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;

}







function renderCookPanel(){


if(!appState.cook.active){


return `


<div class="card cook-card">


<h3>
🔥 Actieve cook
</h3>


<p style="color:var(--muted)">
Geen actieve cook
</p>



<button
class="button secondary"
onclick="startManualCook()">

Start nieuwe cook

</button>


</div>


`;

}





const phases =
appState.cook.phases || [];


const currentPhase =
phases[appState.cook.phase]
||
["Voorbereiden",""];




const phaseProgress =
phases.length
?
Math.round(
((appState.cook.phase + 1) / phases.length) * 100
)
:
0;




return `


<div class="card cook-card premium-cook">


<h3>
🔥 Actieve cook
</h3>




<h2>
${appState.cook.name}
</h2>




<div class="cook-status">

🟢 Running

</div>




<div class="cook-grid">


<div>

<span>Fase</span>

<strong>
${appState.cook.phase + 1}/${Math.max(phases.length,1)}
</strong>

</div>



<div>

<span>Tijd</span>

<strong>
${formatElapsedTime()}
</strong>

</div>



<div>

<span>Dome</span>

<strong>
${appState.cook.domeTarget || "—"}°C
</strong>

</div>



<div>

<span>Kern</span>

<strong>
${appState.cook.meatTarget || "—"}°C
</strong>

</div>


</div>





<div class="phase-box">


<h3>
${currentPhase[0]}
</h3>


<p>
${currentPhase[1]}
</p>


</div>





<div class="cook-progress">


<div
style="width:${phaseProgress}%">
</div>


</div>





<button
class="button"
onclick="completePhase()">

✅ Fase voltooid

</button>



<button
class="button secondary"
onclick="stopCook()">

Stop cook

</button>



</div>


`;

}








function dashboardView(){



const probes =
appState.probes.filter(
p =>
p.active &&
p.type !== "unused"
);




return `




<div
class="status"
data-live-status>

${
appState.bluetooth.connected
?
"🟢 Verbonden"
:
"🔴 Niet verbonden"
}

</div>





<div class="cook-header">


<h2>

${
appState.cook.active
?
"🔥 " + appState.cook.name
:
"🔥 Mijn Kamado"
}

</h2>


<p>
Live temperatuur overzicht
</p>


</div>





<div class="probe-container">


${
probes.length

?

probes
.map(renderProbeCard)
.join("")


:


`

<div class="card">

Geen actieve probes

</div>

`

}


</div>





${renderCookPanel()}







<button
class="button secondary"
onclick="navigate('recipes')">

🍖 Kies een recept

</button>




<br>



<button
class="button"
onclick="startManualCook()">

🔥 Start nieuwe cook

</button>



`;

}








function startManualCook(){


appState.cook.active = true;


appState.cook.name =
"Nieuwe cook";


appState.cook.domeTarget =
110;


appState.cook.meatTarget =
null;


appState.cook.duration =
"";


appState.cook.phase = 0;


appState.cook.phases = [];


appState.cook.startedAt =
    new Date().toISOString();


appState.cook.lastPhaseChange =
    new Date().toISOString();


appState.cook.completedPhases = [];


appState.screen="dashboard";


render();

}








function completePhase(){


if(!appState.cook.active){
    return;
}


appState.cook.completedPhases.push(
    appState.cook.phase
);


if(
appState.cook.phase <
(appState.cook.phases.length-1)
){

    appState.cook.phase++;

}


appState.cook.lastPhaseChange =
new Date();


render();


}








function stopCook(){

finishCookHistory();    

appState.cook.active = false;


appState.cook.name = "";


appState.cook.phases = [];


appState.cook.phase = 0;


appState.cook.startedAt = null;


appState.cook.completedPhases = [];


render();


}