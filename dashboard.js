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



function temperatureProgress(current,target){

    if(!current || !target){
        return 0;
    }

    return Math.min(
        100,
        Math.round((current / target) * 100)
    );

}



function temperatureClass(temp,target){

    if(!temp){
        return "cold";
    }

    if(target && temp >= target){
        return "ready";
    }

    if(temp > 70){
        return "hot";
    }

    return "warming";

}



function updateLiveUi(){


    const statusEl =
        document.querySelector("[data-live-status]");


    if(statusEl){

        statusEl.innerHTML = `

        ${appState.bluetooth.connected ? "🟢" : "🔴"}

        ${appState.bluetooth.device || "Geen apparaat"}

        ${appState.bluetooth.connected ? "· verbonden" : ""}

        `;

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


    const target =
        probe.type==="meat"
        ? appState.cook.meatTarget
        : appState.cook.domeTarget;


    const progress =
        temperatureProgress(
            probe.temperature,
            target
        );


    return `

    <div class="
        probe-card
        ${temperatureClass(
            probe.temperature,
            target
        )}
    ">


        <div class="probe-header">

            <span>
                ${probe.type==="meat" ? "🥩":"🔥"}
                ${probe.name}
            </span>

        </div>



        <div class="big-temperature"
             data-probe-temperature
             data-probe-id="${probe.id}">

            ${formatTemperatureValue(probe.temperature)}

        </div>



        <div class="target">

            Target ${target || "—"}°

        </div>



        <div class="progress">

            <div
            style="
            width:${progress}%
            ">
            </div>

        </div>


    </div>

    `;

}





function dashboardView(){


const activeProbes =
appState.probes.filter(
p=>p.active && p.type!=="unused"
);



return `


<div class="status"
data-live-status>

${appState.bluetooth.connected ? "🟢":"🔴"}

${appState.bluetooth.device || "Geen apparaat"}

</div>



<div class="cook-header">


<h2>

🔥 ${appState.cook.active
? appState.cook.name
:"Nieuwe cook"}

</h2>


<p>

${appState.cook.active
?"Actieve sessie"
:"Geen actieve cook"}

</p>


</div>




<div class="probe-container">


${
activeProbes.length

?

activeProbes
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





<button

class="button"

onclick="navigate('recipes')"

>

🍖 Kies recept

</button>



`;

}