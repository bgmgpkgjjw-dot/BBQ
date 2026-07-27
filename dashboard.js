/* ==========================================================
   Hermanos Grill Companion
   dashboard.js

   Dashboard scherm
   ========================================================== */


function formatTemperatureValue(value){

    if(value === null || value === undefined || Number.isNaN(Number(value))){
        return "—";
    }

    return `${Math.round(Number(value))}°`;

}


function updateLiveUi(){

    const statusEl = document.querySelector("[data-live-status]");

    if(statusEl){
        const batteryText = appState.bluetooth.battery === null || appState.bluetooth.battery === undefined
            ? "Batterij —%"
            : `Batterij ${Math.round(appState.bluetooth.battery)}%`;

        statusEl.textContent = `${appState.bluetooth.connected ? "🟢" : "🔴"} ${appState.bluetooth.device || "Geen apparaat"} · ${appState.bluetooth.connected ? batteryText : "Wacht op Bluetooth-data"}`;
    }


    document.querySelectorAll("[data-probe-temperature]").forEach(el => {

        const probeId = Number(el.getAttribute("data-probe-id"));
        const probe = appState.probes.find(p => p.id === probeId);

        if(probe){
            el.textContent = formatTemperatureValue(probe.temperature);
        }

    });

}


function dashboardView(){


    // Alleen sondes die aan staan én een rol toegewezen hebben
    const activeProbes = appState.probes.filter(
        p => p.active && p.type !== "unused"
    );


    const domeProbes = activeProbes.filter(p => p.type === "dome");

    const otherProbes = activeProbes.filter(p => p.type !== "dome");


    return `


    <div class="status" data-live-status>

        ${appState.bluetooth.connected ? "🟢" : "🔴"}

        ${appState.bluetooth.device}

        ·

        Batterij ${Math.round(appState.bluetooth.battery)}%

    </div>




    ${

        domeProbes.length

        ?

        domeProbes.map(p => `

            <div class="gauge">

                <div>

                    <div class="temp" data-probe-temperature data-probe-id="${p.id}">

                        ${formatTemperatureValue(p.temperature)}

                    </div>

                    <div class="label">

                        ${p.name}

                    </div>

                </div>

            </div>

        `).join("")

        :

        `

        <div class="card">

            <p style="text-align:center; color:var(--muted)">

                Geen dome-sonde actief. Zet er één aan bij Instellingen.

            </p>

        </div>

        `

    }




    ${

        otherProbes.length

        ?

        `

        <div class="probe-grid">

            ${

                otherProbes.map(p => `

                    <div class="card probe-card">

                        <h3>

                            ${p.name}

                        </h3>

                        <div class="temp" style="font-size:36px" data-probe-temperature data-probe-id="${p.id}">

                            ${formatTemperatureValue(p.temperature)}

                        </div>

                        ${

                            p.type === "meat"

                            ?

                            `

                            <p style="color:var(--muted); text-align:center">

                                Target: ${appState.cook.meatTarget || "—"}°C

                            </p>

                            `

                            :

                            ""

                        }

                    </div>

                `).join("")

            }

        </div>

        `

        :

        ""

    }




    <div class="card">


        <h3>

            Actieve cook

        </h3>


        ${
            appState.cook.active

            ?

            `

            <h2>

                ${appState.cook.name}

            </h2>


            <p>

                Dome:

                ${appState.cook.domeTarget}°C

            </p>


            <p>

                Kern:

                ${appState.cook.meatTarget || "—"}°C

            </p>


            `


            :


            `

            <p>

                Geen actieve cook

            </p>


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
