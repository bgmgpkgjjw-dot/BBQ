/* ==========================================================
   Hermanos Grill Companion
   dashboard.js — Premium BBQ dashboard
   ========================================================== */

function formatTemperatureValue(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "—";
    }
    return `${Math.round(Number(value))}°`;
}

function getProbeTarget(probe) {
    if (!appState.cook) return null;
    if (probe.type === "dome") return appState.cook.domeTarget || null;
    if (probe.type === "meat") return appState.cook.meatTarget || null;
    return null;
}

function getProgress(probe) {
    const target = getProbeTarget(probe);
    const temp = Number(probe.temperature);

    if (!target || Number.isNaN(temp)) return 0;

    return Math.min(100, Math.round((temp / target) * 100));
}

function getProbeStatus(probe) {
    const target = getProbeTarget(probe);
    const temp = Number(probe.temperature);

    if (Number.isNaN(temp)) return "";
    if (target && temp >= target) return "ready";
    if (temp >= 70) return "hot";
    return "warming";
}

function updateLiveUi() {
    const status = document.querySelector("[data-live-status]");

    if (status) {
        status.textContent = appState.bluetooth.connected
            ? `🟢 ${appState.bluetooth.device || "Bluetooth"}`
            : "🔴 Niet verbonden";
    }

    document.querySelectorAll("[data-probe-temperature]").forEach(el => {

        const id = Number(el.dataset.probeId);

        const probe = appState.probes.find(p => p.id === id);

        if (probe) {
            el.textContent =
                formatTemperatureValue(probe.temperature);
        }

    });



    const timer =
        document.querySelector("[data-cook-time]");


    if (timer) {

        timer.textContent =
            formatElapsedTime();

    }
}

function renderProbeCard(probe) {

    const target = getProbeTarget(probe);
    const progress = getProgress(probe);

    const isDome = probe.type === "dome";


    return `

    <div class="probe-card premium-probe ${getProbeStatus(probe)} ${isDome ? "dome-card" : "meat-card"}">


        <div class="probe-title">

            <span>
                ${isDome ? "Kamado Dome" : probe.name}
            </span>


            <span class="probe-id">
                P${probe.id}
            </span>

        </div>



        ${isDome

            ?

            `

        <div class="dome-gauge">


            <div class="gauge-circle">


                <div class="gauge-value"
                     data-probe-temperature
                     data-probe-id="${probe.id}">

                    ${formatTemperatureValue(probe.temperature)}

                </div>


                <div class="gauge-label">
                    Dome
                </div>


            </div>


        </div>


        `


            :


            `


        <div class="thermometer-box">


            <div class="thermometer-icon">
                🌡️
            </div>


            <div class="thermometer-value"
                 data-probe-temperature
                 data-probe-id="${probe.id}">

                ${formatTemperatureValue(probe.temperature)}

            </div>


        </div>


        `

        }




        <div class="probe-info">

            ${target
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

function formatElapsedTime() {

    if (!appState.cook.startedAt) {
        return "00:00:00";
    }


    const start =
        new Date(appState.cook.startedAt);


    const totalSeconds =
        Math.floor(
            (Date.now() - start.getTime()) / 1000
        );


    const hours =
        Math.floor(totalSeconds / 3600);


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const seconds =
        totalSeconds % 60;


    return (
        String(hours).padStart(2, "0")
        + ":" +
        String(minutes).padStart(2, "0")
        + ":" +
        String(seconds).padStart(2, "0")
    );

}

function renderCookPanel() {
    if (!appState.cook.active) {
        return `
      <div class="card cook-card">

        <h3>
        🔥 Actieve cook
        </h3>

        <p style="color:var(--muted)">
        Geen actieve cook
        </p>

      </div>
    `;
    }

    const phases =
        appState.cook.phases || [];

    const currentPhase =
        phases[appState.cook.phase] || {
            name: "Voorbereiden",
            domeTarget: null,
            meatTarget: null
        };

    const phaseProgress = phases.length
        ? Math.round(
            ((appState.cook.phase + 1) /
                phases.length) * 100
        )
        : 0;

    return `
    <div class="card cook-card">
      <h3>🔥 Actieve cook</h3>
      <h2>${appState.cook.name}</h2>

      <div class="cook-status">🟢 Running</div>

      <div class="cook-grid">
        <div>
          <span>Fase</span>
          <strong>${appState.cook.phase + 1}/${Math.max(phases.length, 1)}</strong>
        </div>
        <div>
          <span>Tijd</span>
          <strong data-cook-time>${formatElapsedTime()}</strong>
        </div>

        <div>
        <span>Dome doel</span>

        <input
            type="number"
            min="0"
            max="600"
            inputmode="numeric"
            pattern="[0-9]*"
            value="${appState.cook.domeTarget ?? ""}"
            onchange="updateDomeTarget(this.value)"
        >
        </div>

        <div>
        <span>Kern doel</span>

        <input
            type="number"
            min="0"
            max="250"
            inputmode="numeric"
            pattern="[0-9]*"
            value="${appState.cook.meatTarget ?? ""}"
            onchange="updateMeatTarget(this.value)"
        >
        </div>

        </div>

      <div class="phase-box">

        <h3>
            ${currentPhase.name}
        </h3>

        <p>
            🔥 Dome:
            ${currentPhase.domeTarget != null
                ? `${currentPhase.domeTarget}°C`
                : "--"
            }
        </p>

        <p>
            🥩 Meat:
            ${currentPhase.meatTarget != null
                ? `${currentPhase.meatTarget}°C`
                : "--"
            }
        </p>


      <div class="cook-progress">
        <div style="width:${phaseProgress}%"></div>
      </div>

      <div class="phase-actions">

        <button
            class="button secondary"
            onclick="previousPhase()"
            ${
                appState.cook.phase === 0
                    ? "disabled"
                    : ""
            }
        >
            ← Previous Phase
        </button>

        <button
            class="button"
            onclick="completePhase()"
        >
            ✓ Next Phase
        </button>

        <button
            class="button secondary"
            onclick="stopCook()"
        >
            Finish Cook
        </button>

    </div>
 </div>
</div>
  `;
}

function dashboardView() {

    const probes =
        appState.probes.filter(
            p => p.active &&
            p.type !== "unused"
        );

    return `

        <div
            class="status"
            data-live-status
        >
            ${
                appState.bluetooth.connected
                    ? "🟢 Verbonden"
                    : "🔴 Niet verbonden"
            }
        </div>

        <div class="probe-container">

            ${
                probes.length

                    ? probes
                        .map(renderProbeCard)
                        .join("")

                    : `
                        <div class="card">
                            Geen actieve probes
                        </div>
                    `
            }

        </div>

        ${renderCookPanel()}

        ${
            !appState.cook.active

                ? `

                    <button
                        class="button"
                        onclick="navigate('recipes')"
                    >
                        Kies een recept
                    </button>

                    <button
                        class="button"
                        onclick="startManualCook()"
                    >
                        Start nieuwe cook
                    </button>

                `

                : ""
        }

    `;
}

function startManualCook() {

    appState.cook.active = true;

    if (typeof syncWakeLockState === "function") {
        syncWakeLockState();
    }

    appState.cook.name = "Nieuwe cook";

    appState.cook.domeTarget = 110;

    appState.cook.meatTarget = null;

    appState.cook.duration = "";

    appState.cook.phase = 0;

    appState.cook.phases = [];

    appState.cook.startedAt =
        new Date().toISOString();

    appState.cook.lastPhaseChange =
        new Date().toISOString();

    appState.cook.completedPhases = [];


    // START HISTORY SESSION
    if (typeof startCookSession === "function") {

        startCookSession();

    } else {

        console.warn(
            "startCookSession() not available"
        );

    }


    appState.screen = "dashboard";

    render();

}

function completePhase() {

    if (!appState.cook.active) {
        return;
    }

    appState.cook.completedPhases.push(
        appState.cook.phase
    );

    if (
        appState.cook.phase <
        appState.cook.phases.length - 1
    ) {

        appState.cook.phase++;

        const phase =
            appState.cook.phases[
            appState.cook.phase
            ];

        if (phase) {

            appState.cook.domeTarget =
                phase.domeTarget;

            appState.cook.meatTarget =
                phase.meatTarget;
        }
    }

    appState.cook.lastPhaseChange =
        new Date();

    saveAppState();

    render();
}

function previousPhase() {

    if (!appState.cook.active) {
        return;
    }

    if (appState.cook.phase > 0) {

        appState.cook.phase--;

        appState.cook.completedPhases =
            appState.cook.completedPhases.filter(
                phase =>
                    phase !== appState.cook.phase
            );
    }

    appState.cook.lastPhaseChange =
        new Date();

    saveAppState();

    render();
}

window.previousPhase =
    previousPhase;

function stopCook() {

    finishCookSession();

    appState.cook.active = false;

    if (typeof syncWakeLockState === "function") {
        syncWakeLockState();
    }

    appState.cook.name = "";
    appState.cook.recipe = null;

    appState.cook.domeTarget = null;
    appState.cook.meatTarget = null;

    appState.cook.phases = [];
    appState.cook.phase = 0;
    appState.cook.startedAt = null;
    appState.cook.completedPhases = [];

    appState.currentSessionId = null;

    if (
        typeof saveAppState === "function"
    ) {
        saveAppState();
    }

    render();
}


function updateDomeTarget(value) {

    const target = Number(value);

    if (Number.isNaN(target)) {
        return;
    }

    appState.cook.domeTarget = target;

    if (typeof saveAppState === "function") {
        saveAppState();
    }

    render();
}

function updateMeatTarget(value) {

    if (value === "") {
        appState.cook.meatTarget = null;
    } else {

        const target = Number(value);

        if (Number.isNaN(target)) {
            return;
        }

        appState.cook.meatTarget = target;
    }

    if (typeof saveAppState === "function") {
        saveAppState();
    }

    render();
}

setInterval(() => {

    if (
        appState.cook &&
        appState.cook.active
    ) {

        updateLiveUi();

    }

}, 1000);

window.updateDomeTarget =
    updateDomeTarget;

window.updateMeatTarget =
    updateMeatTarget;