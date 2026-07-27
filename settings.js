/* ==========================================================
   Hermanos Grill Companion
   settings.js

   Instellingen scherm: sondebeheer (tot 6 sondes) + app instellingen
   ========================================================== */


// Startwaarde voor een sonde die net actief wordt en nog geen meting heeft
function defaultStartTemperature(type){

    if(type === "dome") return 20;

    if(type === "meat") return 15;

    if(type === "ambient") return 20;

    return null;

}


function toggleProbeActive(id){

    const probe = appState.probes.find(p => p.id === id);

    if(!probe) return;


    probe.active = !probe.active;


    // Bij activeren zonder rol: standaard op "vlees" zetten
    if(probe.active && probe.type === "unused"){

        probe.type = "meat";

    }


    // Zorg dat een net actieve sonde direct een zinnige waarde heeft
    if(probe.active && probe.temperature === null){

        probe.temperature = defaultStartTemperature(probe.type);

    }


    render();

}


function setProbeType(id, type){

    const probe = appState.probes.find(p => p.id === id);

    if(!probe) return;


    probe.type = type;


    if(probe.active && probe.temperature === null){

        probe.temperature = defaultStartTemperature(type);

    }


    render();

}


function setProbeName(id, name){

    const probe = appState.probes.find(p => p.id === id);

    if(!probe) return;


    probe.name = name;

    // geen render() hier: anders springt de cursor in het tekstveld weg
    // tijdens het typen. De naam staat al bij de volgende render goed.

}


function settingsView(){

    return `

    <div class="card">

        <h2>

            Sondes

        </h2>

        <p style="color:var(--muted); font-size:13px; margin-bottom:14px">

            Tot 6 sondes. Zet een sonde aan en kies de rol
            (dome / vlees / ambient). Inactieve sondes worden
            niet getoond op het dashboard.

        </p>

        ${

            appState.probes.map(p => `

                <div class="probe-settings-row">

                    <input
                        type="text"
                        class="probe-name-input"
                        value="${p.name}"
                        oninput="setProbeName(${p.id}, this.value)"
                        ${p.active ? "" : "disabled"}
                    >

                    <select
                        class="probe-type-select"
                        onchange="setProbeType(${p.id}, this.value)"
                        ${p.active ? "" : "disabled"}
                    >
                        <option value="dome" ${p.type === "dome" ? "selected" : ""}>Dome</option>
                        <option value="meat" ${p.type === "meat" ? "selected" : ""}>Vlees</option>
                        <option value="ambient" ${p.type === "ambient" ? "selected" : ""}>Ambient</option>
                    </select>

                    <button
                        class="probe-toggle ${p.active ? "on" : ""}"
                        onclick="toggleProbeActive(${p.id})"
                    >
                        ${p.active ? "Aan" : "Uit"}
                    </button>

                </div>

            `).join("")

        }

    </div>


    <div class="card">

        <h2>

            ${appState.theme.brand}

        </h2>

        <p style="color:var(--muted)">

            Temperatuureenheid: ${appState.settings.temperatureUnit === "C" ? "Celsius" : "Fahrenheit"}

        </p>

    </div>

    `;

}
