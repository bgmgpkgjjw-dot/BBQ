/* ==========================================================
   Hermanos Grill Companion

   history.js

   Saved cook sessions
   ========================================================== */


function historyView() {


    if (
        !appState.sessions ||
        appState.sessions.length === 0
    ) {

        return `

        <div class="card">

            <h2>
            History
            </h2>

            <p style="color:var(--muted)">
            No saved cooks yet.
            </p>

        </div>

        `;

    }



    return `


    <div class="card">

        <h2>
        Cook history
        </h2>

    </div>



    ${appState.sessions
            .map(renderHistoryCard)
            .join("")
        }


    `;


}




function renderHistoryCard(session) {


    const date =
        new Date(
            session.startedAt
        )
            .toLocaleDateString(
                "en-US"
            );



    const samples =
        session.temperatureHistory
            ?
            session.temperatureHistory.length
            :
            0;



    return `


    <div class="card history-card">


        <h2>
        ${session.name || session.recipe}
        </h2>



        <p>
        ${date}
        </p>



        <p>
        ${session.duration || "—"}
        </p>



        <p>
        ${samples} temperature readings
        </p>



        <button
        class="button secondary"
        onclick="openHistorySession('${session.id}')">

        View details

        </button>



    </div>


    `;


}





function openHistorySession(id) {


    const session =
        appState.sessions.find(
            s => s.id === id
        );


    if (!session) {
        return;
    }


    appState.selectedHistory =
        session;


    render();


}

function historyDetailView() {


    const session =
        appState.selectedHistory;


    if (!session) {

        return historyView();

    }



    const samples =
        session.temperatureHistory || [];



    const maxDome =
        samples.length
            ?
            Math.max(
                ...samples.map(
                    x => x.dome || 0
                )
            )
            :
            "—";



    const maxMeat =
        samples.length
            ?
            Math.max(
                ...samples.map(
                    x => x.meat || 0
                )
            )
            :
            "—";

    setTimeout( () => renderHistoryDetailChart(), 50 );

    return `


    <div class="section-actions">
        <button
            class="button secondary"
            onclick="closeHistoryDetail()">
            ← Back
        </button>
    </div>



    <div class="card">


        <h2>
        ${session.name || session.recipe}
        </h2>

        <div class="stacked-actions">
            <button
                class="button secondary"
                onclick="renameCook('${session.id}')">
                Rename cook
            </button>

            <button
                class="button danger"
                onclick="deleteCook('${session.id}')">
                Delete cook
            </button>
        </div>

        <p>
        Started:
        ${new Date(session.startedAt).toLocaleString("en-US")}
        </p>


        <p>
        Duration:
        ${session.duration || "—"}
        </p>


        <p>
        Dome target:
        <strong>
        ${session.domeTarget ?? "—"}°C
        </strong>
        </p>


        <p>
        Core target:
        <strong>
        ${session.meatTarget ?? "—"}°C
        </strong>
        </p>


    </div>




    <div class="card">

        <h3>
        Temperature data
        </h3>


        <p>
        Measurements:
        ${samples.length}
        </p>


        <p>
        Max dome:
        ${maxDome}°C
        </p>


        <p>
        Max core temperature:
        ${maxMeat}°C
        </p>


    </div>



    <div class="card">


        <h3>
        Temperature trend
        </h3>

        <div class="chart-container">
            <canvas
                id="historyChart">
            </canvas>
        </div>

    </div>
    
    

    `;


}





function closeHistoryDetail() {

    appState.selectedHistory = null;

    render();

}

function renameCook(sessionId) {

    const session =
        appState.sessions.find(
            s => s.id === sessionId
        );


    if (!session) {
        console.error("Session not found", sessionId);
        return;
    }


    const currentName =
        session.name ||
        session.recipe ||
        "New cook";


    const newName =
        prompt(
            "New name for this cook:",
            currentName
        );


    if (!newName || !newName.trim()) {
        return;
    }


    session.name =
        newName.trim();


    // keep backwards compatibility
    session.recipe =
        session.recipe || session.name;


    saveSessions();


    render();

}

function deleteCook(sessionId) {

    const session =
        appState.sessions.find(
            s => s.id === sessionId
        );

    if (!session) {
        return;
    }

    const confirmed =
        confirm(
            `Delete cook "${session.name || session.recipe}"?\n\nThis action cannot be undone.`
        );

    if (!confirmed) {
        return;
    }

    appState.sessions =
        appState.sessions.filter(
            s => s.id !== sessionId
        );

    saveSessions();

    appState.screen = "history";

    render();

}

let historyDetailChart = null;

function renderHistoryDetailChart() {

    const session =
        appState.selectedHistory;

    if (!session) {
        return;
    }

    const canvas =
        document.getElementById(
            "historyChart"
        );

    if (!canvas) {
        return;
    }

    const samples =
        session.temperatureHistory || [];

    if (!samples.length) {
        return;
    }

    if (historyDetailChart) {
        historyDetailChart.destroy();
    }

    historyDetailChart =
        new Chart(canvas, {

            type: "line",

            data: {

                labels: samples.map(
                    s =>
                        new Date(
                            s.timestamp
                        ).toLocaleTimeString(
                            "nl-NL",
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        )
                ),

                datasets: [

                    {
                        label: "Dome",

                        data: samples.map(
                            s => s.dome
                        ),

                        borderColor:
                            "#ff6b1a",

                        backgroundColor:
                            "rgba(255,107,26,.15)",

                        tension: .3,

                        pointRadius: 0
                    },

                    {
                        label: "Kern",

                        data: samples.map(
                            s => s.meat
                        ),

                        borderColor:
                            "#c1272d",

                        backgroundColor:
                            "rgba(193,39,45,.15)",

                        tension: .3,

                        pointRadius: 0
                    }

                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {
                    mode: "index",
                    intersect: false
                },

                plugins: {

                    legend: {
                        labels: {
                            color: "#F2EBDD"
                        }
                    }
                },

                scales: {

                    x: {
                        ticks: {
                            color: "#918678",
                            maxTicksLimit: 10
                        }
                    },

                    y: {
                        ticks: {
                            color: "#918678"
                        },

                        title: {
                            display: true,
                            text: "°C",
                            color: "#918678"
                        }
                    }
                }
            }
        });
}