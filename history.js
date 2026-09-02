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
            ).toFixed(1)
            :
            "—";



    const maxMeat =
        samples.length
            ?
            Math.max(
                ...samples.map(
                    x => x.meat || 0
                )
            ).toFixed(1)
            :
            "—";

    const latestSample = samples.at(-1) || {};
    const latestDome = Number.isFinite(latestSample.dome)
        ? `${latestSample.dome.toFixed(1)}°C`
        : "—";
    const latestMeat = Number.isFinite(latestSample.meat)
        ? `${latestSample.meat.toFixed(1)}°C`
        : "—";

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


    </div>




    <div class="card">

        <h3>
        Temperature data
        </h3>


        <p>
        Measurements:
        ${samples.length}
        </p>

        <div class="history-metrics">
            <div class="history-metric dome-metric">
                <span class="history-metric-label">Dome now</span>
                <strong>${latestDome}</strong>
                <small>Peak ${maxDome}°C</small>
            </div>

            <div class="history-metric core-metric">
                <span class="history-metric-label">Core now</span>
                <strong>${latestMeat}</strong>
                <small>Peak ${maxMeat}°C</small>
            </div>
        </div>


    </div>



    <div class="card">


        <div class="chart-heading">
            <div>
                <h3>Temperature trend</h3>
                <p class="chart-subtitle">Dome and food core temperature over time</p>
            </div>
            <div class="chart-legend" aria-label="Chart legend">
                <span><i class="legend-swatch dome-swatch"></i>Dome</span>
                <span><i class="legend-swatch core-swatch"></i>Core</span>
            </div>
        </div>

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

    if (historyDetailChart) {
        historyDetailChart.destroy();
        historyDetailChart = null;
    }

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

    appState.selectedHistory = null;
    appState.screen = "history";

    render();

}

let historyDetailChart = null;

function downsampleTemperatureSamples(samples, maxPoints = 600) {
    if (samples.length <= maxPoints) {
        return samples;
    }

    const firstTimestamp = samples[0].timestamp;
    const lastTimestamp = samples.at(-1).timestamp;
    const bucketDuration = Math.max(
        1,
        (lastTimestamp - firstTimestamp) / maxPoints
    );
    const buckets = new Map();

    samples.forEach(sample => {
        const bucket = Math.min(
            maxPoints - 1,
            Math.floor((sample.timestamp - firstTimestamp) / bucketDuration)
        );

        if (!buckets.has(bucket)) {
            buckets.set(bucket, []);
        }

        buckets.get(bucket).push(sample);
    });

    return Array.from(buckets.values()).map(bucket => {
        const numericDome = bucket.map(sample => sample.dome).filter(Number.isFinite);
        const numericMeat = bucket.map(sample => sample.meat).filter(Number.isFinite);
        const first = bucket[0];

        return {
            timestamp: bucket[Math.floor(bucket.length / 2)].timestamp,
            dome: numericDome.length
                ? numericDome.reduce((sum, value) => sum + value, 0) / numericDome.length
                : null,
            meat: numericMeat.length
                ? numericMeat.reduce((sum, value) => sum + value, 0) / numericMeat.length
                : null,
            domeMin: numericDome.length ? Math.min(...numericDome) : null,
            domeMax: numericDome.length ? Math.max(...numericDome) : null,
            meatMin: numericMeat.length ? Math.min(...numericMeat) : null,
            meatMax: numericMeat.length ? Math.max(...numericMeat) : null,
            domeEvent: bucket.some(sample => sample.domeEvent === "opening")
                ? "opening"
                : first.domeEvent
        };
    });
}

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

    const samples = downsampleTemperatureSamples(
        session.temperatureHistory || []
    );

    if (!samples.length) {
        return;
    }

    // Skip rebuilding when the same session's data hasn't changed since last draw,
    // so background events (WS ticks, unrelated renders) don't churn the chart.
    const rawSampleCount = (session.temperatureHistory || []).length;
    if (
        historyDetailChart &&
        historyDetailChart._bbqSessionId === session.id &&
        historyDetailChart._bbqSampleCount === rawSampleCount
    ) {
        return;
    }

    if (historyDetailChart) {
        historyDetailChart.destroy();
    }

    const domeColor = "#E5A93D";
    const coreColor = "#4DB6A5";
    const domeTarget = session.domeTarget;
    const coreTarget = session.meatTarget;

    const targetDataset = (label, value, color) => value == null
        ? []
        : [{
            label,
            data: samples.map(() => value),
            borderColor: color,
            borderDash: [6, 5],
            borderWidth: 1,
            pointRadius: 0,
            fill: false,
            tension: 0,
            isTargetLine: true
        }];

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
                        label: "Dome temperature",

                        data: samples.map(
                            s => s.dome
                        ),

                        borderColor: domeColor,

                        backgroundColor: "rgba(229,169,61,.08)",

                        borderWidth: 3,

                        tension: .25,

                        pointRadius: 0,

                        pointHoverRadius: 5
                    },

                    {
                        label: "Core temperature",

                        data: samples.map(
                            s => s.meat
                        ),

                        borderColor: coreColor,

                        backgroundColor: "rgba(77,182,165,.08)",

                        borderWidth: 3,

                        tension: .25,

                        pointRadius: 0,

                        pointHoverRadius: 5
                    }

                ].concat(
                    targetDataset("Dome target", domeTarget, domeColor),
                    targetDataset("Core target", coreTarget, coreColor)
                )
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
                            color: "#F2EBDD",
                            filter: item => !item.text.endsWith("target")
                        }
                    },

                    tooltip: {
                        filter: context => !context.dataset.isTargetLine,
                        callbacks: {
                            label: context => {
                                const value = context.parsed.y;
                                return value == null
                                    ? context.dataset.label
                                    : `${context.dataset.label}: ${Number(value).toFixed(1)}°C`;
                            }
                        }
                    }
                },

                scales: {

                    x: {
                        grid: {
                            color: "rgba(242,235,221,.06)"
                        },
                        ticks: {
                            color: "#918678",
                            maxTicksLimit: 10
                        }
                    },

                    y: {
                        grid: {
                            color: "rgba(242,235,221,.08)"
                        },
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

    historyDetailChart._bbqSessionId = session.id;
    historyDetailChart._bbqSampleCount = rawSampleCount;

    setupHistoryChartTooltipDismiss(canvas);
}

let historyChartTooltipDismissBound = false;

// Chart.js tooltips (mode "index") have no touch equivalent of "mouse left the
// canvas", so on mobile they stay stuck after a tap unless dismissed manually.
function setupHistoryChartTooltipDismiss(canvas) {
    if (historyChartTooltipDismissBound) {
        return;
    }

    historyChartTooltipDismissBound = true;

    document.addEventListener("touchstart", event => {
        const activeCanvas = document.getElementById("historyChart");

        if (
            historyDetailChart &&
            activeCanvas &&
            !activeCanvas.contains(event.target)
        ) {
            historyDetailChart.setActiveElements([]);
            historyDetailChart.tooltip.setActiveElements([], { x: 0, y: 0 });
            historyDetailChart.update();
        }
    });
}