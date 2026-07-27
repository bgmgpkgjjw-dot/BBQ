/* ==========================================================
   Hermanos Grill Companion
   dashboard.js

   Dashboard scherm
   ========================================================== */


function dashboardView(){


    // Alleen sondes die aan staan én een rol toegewezen hebben
    const activeProbes = appState.probes.filter(
        p => p.active && p.type !== "unused"
    );


    const domeProbes = activeProbes.filter(p => p.type === "dome");

    const otherProbes = activeProbes.filter(p => p.type !== "dome");


    return `


    <div class="status">

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

                    <div class="temp">

                        ${Math.round(p.temperature)}°

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

                        <div class="temp" style="font-size:36px">

                            ${Math.round(p.temperature)}°

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
