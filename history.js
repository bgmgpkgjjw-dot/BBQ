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
            Geschiedenis
            </h2>

            <p style="color:var(--muted)">
            Nog geen opgeslagen cooks.
            </p>

        </div>

        `;

    }



    return `


    <div class="card">

        <h2>
        Cook geschiedenis
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
                "nl-NL"
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
        ${samples} temperatuurmetingen
        </p>



        <button
        class="button secondary"
        onclick="openHistorySession('${session.id}')">

        Bekijk details

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
            ← Terug
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
                Naam wijzigen
            </button>

            <button
                class="button danger"
                onclick="deleteCook('${session.id}')">
                Verwijder cook
            </button>
        </div>

        <p>
        Gestart:
        ${new Date(session.startedAt).toLocaleString("nl-NL")}
        </p>


        <p>
        Duur:
        ${session.duration || "—"}
        </p>


        <p>
        Dome doel:
        <strong>
        ${session.domeTarget ?? "—"}°C
        </strong>
        </p>


        <p>
        Kern doel:
        <strong>
        ${session.meatTarget ?? "—"}°C
        </strong>
        </p>


    </div>




    <div class="card">

        <h3>
        Temperatuur data
        </h3>


        <p>
        Metingen:
        ${samples.length}
        </p>


        <p>
        Max dome:
        ${maxDome}°C
        </p>


        <p>
        Max kern temperatuur:
        ${maxMeat}°C
        </p>


    </div>



    <div class="card">


        <h3>
        Temperatuurverloop
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
        "Nieuwe cook";


    const newName =
        prompt(
            "Nieuwe naam voor deze cook:",
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
            `Cook "${session.name || session.recipe}" verwijderen?\n\nDeze actie kan niet ongedaan worden gemaakt.`
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