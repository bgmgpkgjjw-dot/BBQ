/* ==========================================================
   Hermanos Grill Companion

   history.js

   Temperature history + graphs
   ========================================================== */


let temperatureChart = null;




function recordTemperatureHistory() {


    if (!appState.cook.active) {
        return;
    }


    if (!appState.history) {
        return;
    }




    if (!appState.history.activeSession.startedAt) {

        appState.history.activeSession.startedAt =
            new Date().toISOString();

    }





    const sample = {


        timestamp:
            Date.now(),


        elapsed:

            Math.floor(
                (
                    Date.now()
                    -
                    new Date(
                        appState.history.activeSession.startedAt
                    ).getTime()

                ) / 60000
            ),



        dome:

            appState.probes
                .find(
                    p => p.type === "dome"
                )
                ?.temperature || null,



        meat:

            appState.probes
                .find(
                    p => p.type === "meat"
                )
                ?.temperature || null


    };




    appState.history.activeSession.samples.push(sample);



    // max 6 hours of samples
    if (
        appState.history.activeSession.samples.length > 720
    ) {

        appState.history.activeSession.samples.shift();

    }


}







function finishCookHistory() {


    const session =
        appState.history.activeSession;



    if (
        !session.samples.length
    ) {
        return;
    }




    appState.history.sessions.push({

        id:
            Date.now(),


        name:
            appState.cook.name,


        startedAt:
            session.startedAt,


        finishedAt:
            new Date().toISOString(),


        samples:
            session.samples


    });




    appState.history.activeSession = {

        startedAt: null,

        samples: []

    };


}








function historyView() {


    return `


<div class="card">


<h2>
📈 Temperatuur verloop
</h2>


<div class="chart-container">

<canvas id="temperatureChart"></canvas>

</div>


</div>




<div class="card">


<h3>
Cook historie
</h3>



${appState.history.sessions.length

            ?

            appState.history.sessions
                .map(
                    s => `

<div class="recipe">

<h2>
${s.name}
</h2>

<p>
${new Date(s.finishedAt)
                            .toLocaleString()}
</p>


</div>


`
                )
                .join("")

            :

            `
<p style="color:var(--muted)">
Nog geen afgeronde cooks.
</p>
`

        }


</div>


`;

}









function renderTemperatureChart() {


    const canvas =
        document.getElementById(
            "temperatureChart"
        );



    if (!canvas) {
        return;
    }



    const samples =
        appState.history.activeSession.samples;



    if (!samples.length) {
        return;
    }






    if (temperatureChart) {

        temperatureChart.destroy();

    }






    temperatureChart =
        new Chart(
            canvas,
            {


                type: "line",



                data: {


                    labels:

                        samples.map(
                            s => `${s.elapsed} min`
                        ),



                    datasets: [

                        {


                            label: "🔥 Dome",

                            data:

                                samples.map(
                                    s => s.dome
                                ),



                            tension: .3

                        },



                        {


                            label: "🥩 Kern temperatuur",

                            data:

                                samples.map(
                                    s => s.meat
                                ),



                            tension: .3

                        }


                    ]


                },



                options: {


                    responsive: true,


                    interaction: {

                        mode: "index",

                        intersect: false

                    },


                    scales: {


                        y: {

                            beginAtZero: false

                        }


                    }


                }


            }

        );


}
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
            📈 Geschiedenis
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
        📈 Cook geschiedenis
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
        📅 ${date}
        </p>



        <p>
        ⏱ ${session.duration || "—"}
        </p>



        <p>
        🌡 ${samples} temperatuurmetingen
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



    return `


    <button
    class="button secondary"
    onclick="closeHistoryDetail()">

    ← Terug

    </button>



    <div class="card">


        <h2>
        ${session.name || session.recipe}
        </h2>
        
        <button
        class="button secondary"
        onclick="renameCook('${session.id}')">

        ✏️ Naam wijzigen

        </button>

        <br>

        <button
        class="button danger"
        onclick="deleteCook('${session.id}')">

        🗑 Verwijder cook

        </button>

        <br>



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
    
    setTimeout(
    () => renderHistoryDetailChart(),
    50
    );

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
                        label: "🔥 Dome",

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
                        label: "🥩 Kern",

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