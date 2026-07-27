/* ==========================================================
   Hermanos Grill Companion

   dashboard.js

   Compact BBQ dashboard
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

    const target =
        getProbeTarget(probe);


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

    const target =
        getProbeTarget(probe);


    const temp =
        Number(probe.temperature);


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
    .querySelectorAll(
        "[data-probe-temperature]"
    )
    .forEach(el=>{


        const id =
            Number(
                el.dataset.probeId
            );


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
        getProbeTarget(probe);


    const progress =
        getProgress(probe);


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





<button
class="button"
onclick="navigate('recipes')">

🍖 Kies recept

</button>


`;

}