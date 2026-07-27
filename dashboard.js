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




function getTemperatureProgress(probe){

    const target = getProbeTarget(probe);


    if(
        !target ||
        !probe.temperature
    ){
        return 0;
    }


    return Math.min(
        100,
        Math.round(
            (probe.temperature / target) * 100
        )
    );

}




function getTemperatureState(probe){

    const temp = Number(probe.temperature);

    const target = Number(
        getProbeTarget(probe)
    );


    if(!temp){

        return "cold";

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


    const statusEl =
        document.querySelector(
            "[data-live-status]"
        );


    if(statusEl){


        if(appState.bluetooth.connected){


            const battery =
                appState.bluetooth.battery === null ||
                appState.bluetooth.battery === undefined

                ?

                ""

                :

                ` · 🔋 ${Math.round(appState.bluetooth.battery)}%`;


            statusEl.textContent =
                `🟢 ${appState.bluetooth.device || "Bluetooth"} connected${battery}`;


        }
        else{


            statusEl.textContent =
                "🔴 Geen Bluetooth verbinding";


        }

    }





    document
    .querySelectorAll("[data-probe-temperature]")
    .forEach(el=>{


        const probeId =
            Number(
                el.getAttribute(
                    "data-probe-id"
                )
            );


        const probe =
            appState.probes.find(
                p=>p.id === probeId
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
        getTemperatureProgress(probe);


    const state =
        getTemperatureState(probe);



    const icon =
        probe.type === "meat"
        ?
        "🥩"
        :
        "🔥";



    return `


    <div class="probe-card ${state}">


        <div class="probe-header">


            <span>

                ${icon}

                ${probe.name}

            </span>


            <span class="probe-number">

                P${probe.id}

            </span>


        </div>





        <div

            class="big-temperature"

            data-probe-temperature

            data-probe-id="${probe.id}"

        >

            ${formatTemperatureValue(probe.temperature)}

        </div>





        <div class="probe-target">


            ${
                target

                ?

                `Target ${target}°C`

                :

                "Geen doeltemperatuur"

            }


        </div>





        <div class="progress-bar">


            <div

                class="progress-value"

                style="width:${progress}%"

            ></div>


        </div>




    </div>


    `;


}








function dashboardView(){



    const activeProbes =
        appState.probes.filter(
            p =>
            p.active &&
            p.type !== "unused"
        );





    return `




    <div

        class="status"

        data-live-status

    >

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

            `🔥 ${appState.cook.name}`

            :

            "🔥 Nieuwe cook"

        }


        </h2>



        <p>


        ${
            appState.cook.active

            ?

            "Actieve grillsessie"

            :

            "Start een recept om te beginnen"

        }


        </p>



    </div>







    <div class="probe-container">


        ${
            activeProbes.length


            ?


            activeProbes
            .map(
                renderProbeCard
            )
            .join("")



            :


            `


            <div class="card empty-card">


                <p>

                    Geen actieve probes.

                    Activeer probes via instellingen.

                </p>


            </div>


            `

        }


    </div>








    <button

        class="button"

        onclick="navigate('recipes')"

    >

        🍖 Kies een recept


    </button>





    `;


}