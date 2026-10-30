/* ==========================================================
   Hermanos Grill Companion

   history.js

   Saved cook sessions
   ========================================================== */


function historyView() {

    if (!appState.sessions || appState.sessions.length === 0) {
        return `
        <div class="empty-state">
            <p class="empty-title">No cooks yet</p>
            <p class="empty-text">Finished cooks show up here with their graph, notes and photos.</p>
        </div>`;
    }

    return `
    <p class="list-hint">${appState.sessions.length} cook${appState.sessions.length === 1 ? "" : "s"} · swipe left to delete</p>
    ${appState.sessions.map(renderHistoryCard).join("")}`;
}

function getSessionPeakCore(session) {
    const values = (session.temperatureHistory || [])
        .map(sample => sample.meat)
        .filter(Number.isFinite);
    return values.length ? Math.max(...values) : null;
}

function renderHistoryCard(session) {

    const date = new Date(session.startedAt).toLocaleDateString(
        "en-GB",
        { day: "numeric", month: "short", year: "numeric" }
    );

    const peakCore = getSessionPeakCore(session);
    const photoCount = (session.photos || []).length;

    return `
    <div class="history-swipe" data-session-id="${session.id}">

        <div class="history-swipe-delete">
            <button type="button" aria-label="Delete cook"
                onclick="deleteCook('${session.id}')">
                Delete
            </button>
        </div>

        <div class="history-card" role="button" tabindex="0"
            onclick="openHistorySessionFromTap('${session.id}')">

            <div class="history-card-main">
                <h2 class="history-card-title">${escapeHtmlText(session.name || session.recipe || "Cook")}</h2>
                <p class="history-card-date">${date}</p>
                <div class="history-chips">
                    <span class="chip">${escapeHtmlText(session.duration || "—")}</span>
                    ${peakCore != null ? `<span class="chip">Core ${peakCore.toFixed(0)}°C</span>` : ""}
                    ${photoCount ? `<span class="chip">${photoCount} photo${photoCount > 1 ? "s" : ""}</span>` : ""}
                </div>
            </div>

            <div class="history-card-side">
                ${session.rating ? `<span class="history-rating">${renderStars(session.rating)}</span>` : ""}
                <span class="history-chevron" aria-hidden="true">›</span>
            </div>
        </div>
    </div>`;
}

// A swipe must not count as a tap on the card underneath.
let historyLastSwipeAt = 0;

function openHistorySessionFromTap(id) {
    if (Date.now() - historyLastSwipeAt < 350) return;
    openHistorySession(id);
}

const HISTORY_SWIPE_OPEN_DISTANCE = 84;
let historySwipeState = null;
let historySwipeOpenCard = null;

function closeHistorySwipeCard(card) {
    card.style.transition = "transform .2s ease";
    card.style.transform = "translateX(0)";
}

function openHistorySwipeCard(card) {
    card.style.transition = "transform .2s ease";
    card.style.transform = `translateX(-${HISTORY_SWIPE_OPEN_DISTANCE}px)`;
}

// Delegated on document (not the cards themselves) since history cards are
// recreated on every render, which would otherwise drop any bound listeners.
function initHistorySwipeGestures() {

    document.addEventListener("pointerdown", event => {
        const wrap = event.target.closest(".history-swipe");

        if (!wrap) {
            if (historySwipeOpenCard) {
                closeHistorySwipeCard(historySwipeOpenCard);
                historySwipeOpenCard = null;
            }
            return;
        }

        // Let the delete button's own click handler fire normally.
        if (event.target.closest(".history-swipe-delete")) {
            return;
        }

        const card = wrap.querySelector(".history-card");
        if (!card) {
            return;
        }

        if (historySwipeOpenCard && historySwipeOpenCard !== card) {
            closeHistorySwipeCard(historySwipeOpenCard);
            historySwipeOpenCard = null;
        }

        historySwipeState = {
            card,
            startX: event.clientX,
            startY: event.clientY,
            startTranslate: historySwipeOpenCard === card ? -HISTORY_SWIPE_OPEN_DISTANCE : 0,
            axis: null
        };

        card.style.transition = "none";
    });

    document.addEventListener("pointermove", event => {
        if (!historySwipeState) {
            return;
        }

        const deltaX = event.clientX - historySwipeState.startX;
        const deltaY = event.clientY - historySwipeState.startY;

        if (!historySwipeState.axis) {
            if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
                return;
            }
            historySwipeState.axis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
        }

        if (historySwipeState.axis !== "x") {
            return;
        }

        const next = Math.min(
            0,
            Math.max(-HISTORY_SWIPE_OPEN_DISTANCE, historySwipeState.startTranslate + deltaX)
        );

        historySwipeState.card.style.transform = `translateX(${next}px)`;
    });

    const finishHistorySwipe = event => {
        if (!historySwipeState) {
            return;
        }

        const { card, axis, startX, startTranslate } = historySwipeState;
        const deltaX = (event.clientX ?? startX) - startX;
        const finalTranslate = startTranslate + deltaX;

        historySwipeState = null;

        if (axis === "x" && Math.abs(deltaX) > 8) {
            historyLastSwipeAt = Date.now();
        }

        if (axis !== "x") {
            card.style.transition = "transform .2s ease";
            card.style.transform = `translateX(${historySwipeOpenCard === card ? -HISTORY_SWIPE_OPEN_DISTANCE : 0}px)`;
            return;
        }

        if (finalTranslate <= -HISTORY_SWIPE_OPEN_DISTANCE / 2) {
            openHistorySwipeCard(card);
            historySwipeOpenCard = card;
        } else {
            closeHistorySwipeCard(card);
            historySwipeOpenCard = null;
        }
    };

    document.addEventListener("pointerup", finishHistorySwipe);
    document.addEventListener("pointercancel", finishHistorySwipe);
}

initHistorySwipeGestures();




function openHistorySession(id) {


    const session =
        appState.sessions.find(
            s => s.id === id
        );


    if (!session) {
        return;
    }

    // Self-heal a stale target on the still-active cook (e.g. changed before
    // the target-sync fix existed), so the chart shows the current target.
    if (
        appState.cook?.active &&
        session.id === appState.currentSessionId
    ) {
        if (
            session.domeTarget !== appState.cook.domeTarget ||
            session.meatTarget !== appState.cook.meatTarget
        ) {
            session.domeTarget = appState.cook.domeTarget;
            session.meatTarget = appState.cook.meatTarget;
            session.updatedAt = new Date().toISOString();

            if (typeof saveSessions === "function") {
                saveSessions();
            }
        }
    }


    appState.selectedHistory =
        session;


    render();


}

// Pi sync replaces session objects. Keep the open detail pointed at the live one
// so the chart and target lines are not stuck on a stale copy.
function getOpenHistorySession() {
    const selected = appState.selectedHistory;
    if (!selected) {
        return null;
    }

    const live = appState.sessions?.find(session => session.id === selected.id);
    if (live && live !== selected) {
        appState.selectedHistory = live;
    }

    return live || selected;
}

function historyChartIsCurrent(chart, canvas, session, sampleCount) {
    return Boolean(
        chart &&
        chart.canvas === canvas &&
        chart._bbqSessionId === session.id &&
        chart._bbqSampleCount === sampleCount &&
        chart._bbqDomeTarget === session.domeTarget &&
        chart._bbqMeatTarget === session.meatTarget &&
        (chart._bbqEvents || "") === eventSignature(session)
    );
}

function eventSignature(session) {
    return (session?.events || [])
        .map(event => `${event.id}:${event.timestamp}:${event.reason || ""}`)
        .join("|");
}

function syncSessionLidEvents(session) {
    if (!session || typeof detectLidEvents !== "function" || typeof mergeLidEvents !== "function") {
        return false;
    }

    const samples = (session.temperatureHistory || [])
        .filter(sample => sample && Number.isFinite(sample.timestamp) && Number.isFinite(sample.dome) && sample.dome > 0);
    const merged = mergeLidEvents(session.events, detectLidEvents(samples).events);
    session.events = merged.events;
    return merged.changed;
}

function settingsFromCook(session) {
    const phases = typeof structuredClone === "function"
        ? structuredClone(session.phases || [])
        : JSON.parse(JSON.stringify(session.phases || []));
    const first = phases[0] || {};

    return {
        name: session.name || session.recipe || "New cook",
        recipe: session.recipe || null,
        phases,
        domeTarget: first.domeTarget ?? session.domeTarget ?? null,
        meatTarget: first.meatTarget ?? session.meatTarget ?? null,
        likeSessionId: session.id
    };
}

function cookPeaks(session) {
    const samples = session?.temperatureHistory || [];
    const dome = samples.map(sample => sample.dome).filter(Number.isFinite);
    const meat = samples.map(sample => sample.meat).filter(Number.isFinite);

    return {
        dome: dome.length ? Math.max(...dome) : null,
        meat: meat.length ? Math.max(...meat) : null
    };
}

// Friends get the result, not the private journal.
function shareCookText(session) {
    const peaks = cookPeaks(session);
    const when = session.startedAt
        ? new Date(session.startedAt).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
        : "";
    const lines = [
        session.name || session.recipe || "Cook",
        [when, session.duration].filter(Boolean).join(" · "),
        session.rating ? renderStars(session.rating) : "",
        peaks.dome != null ? `Dome peak ${peaks.dome.toFixed(0)}°C` : "",
        peaks.meat != null ? `Core peak ${peaks.meat.toFixed(0)}°C` : ""
    ];

    return lines.filter(Boolean).join("\n");
}

function historyDetailView() {


    const selected =
        getOpenHistorySession();


    if (!selected) {

        return historyView();

    }

    // Prefer the live object so journal edits show after a Pi sync replaced the reference.
    const session =
        appState.sessions.find(s => s.id === selected.id) || selected;

    if (syncSessionLidEvents(session)) {
        saveSessions();
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


    <div class="detail-nav">
        <button type="button" class="btn btn-ghost btn-sm" onclick="closeHistoryDetail()">‹ Back</button>
        <div class="detail-nav-actions">
            <button type="button" class="icon-btn" aria-label="Rename cook"
                onclick="renameCook('${session.id}')">${Icons.edit}</button>
            <button type="button" class="icon-btn icon-btn-danger" aria-label="Delete cook"
                onclick="deleteCook('${session.id}')">${Icons.trash}</button>
        </div>
    </div>

    <div class="detail-hero">
        <h2 class="detail-title">${escapeHtmlText(session.name || session.recipe)}</h2>
        <p class="detail-sub">
            ${new Date(session.startedAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            · ${escapeHtmlText(session.duration || "—")}
        </p>
        ${session.rating ? `<p class="history-rating">${renderStars(session.rating)}</p>` : ""}
    </div>

    <div class="action-row">
        <button type="button" class="btn btn-primary" onclick="cookLikeThis('${session.id}')">Cook like this</button>
        <button type="button" class="btn btn-ghost" onclick="shareCook('${session.id}')">Share</button>
    </div>

    <div class="card">

        <h3>
        Temperature data
        </h3>



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

    ${renderLidEventList(session)}

    ${renderDomeSummaryCard(session)}

    ${renderJournalCard(session)}

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

async function renameCook(sessionId) {

    const session = appState.sessions.find(s => s.id === sessionId);

    if (!session) {
        console.error("Session not found", sessionId);
        return;
    }

    const newName = await askText(
        "Rename cook",
        session.name || session.recipe || "New cook",
        { placeholder: "Cook name" }
    );

    if (!newName) {
        return;
    }

    session.name = newName;

    // keep backwards compatibility
    session.recipe = session.recipe || session.name;

    touchSession(session);
    render();
}

async function deleteCook(sessionId) {

    const session =
        appState.sessions.find(
            s => s.id === sessionId
        );

    if (!session) {
        return;
    }

    const confirmed = await askConfirm(
        "Delete this cook?",
        `"${session.name || session.recipe}" and its photos will be removed. This cannot be undone.`,
        { confirmText: "Delete", danger: true }
    );

    if (!confirmed) {
        return;
    }

    appState.sessions =
        appState.sessions.filter(
            s => s.id !== sessionId
        );

    (session.photos || []).forEach(deletePhotoFromPi);

    if (typeof addDeletedSessionId === "function") {
        addDeletedSessionId(sessionId);
    }

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
            meatMax: numericMeat.length ? Math.max(...numericMeat) : null
        };
    });
}

function chartTooltipFilter(context) {
    if (context.dataset.isTargetLine) return false;
    if (context.dataset.isEvent) {
        return context.dataset.eventMeta?.[context.dataIndex] != null;
    }
    return context.parsed.y != null;
}

function chartTooltipLabel(context) {
    if (context.dataset.isEvent) {
        const event = context.dataset.eventMeta?.[context.dataIndex];
        if (!event) return "Lid opened";
        return event.reason
            ? `Lid opened · ${event.reason}`
            : "Lid opened · tap to say why";
    }

    const value = context.parsed.y;
    return value == null
        ? context.dataset.label
        : `${context.dataset.label}: ${Number(value).toFixed(1)}°C`;
}

function openLidEventFromChart(chart, elements, sessionId) {
    const hit = elements.find(element => chart.data.datasets[element.datasetIndex]?.isEvent);
    const event = hit && chart.data.datasets[hit.datasetIndex].eventMeta?.[hit.index];
    if (event?.type === "lid") {
        explainLidEvent(sessionId, event.id);
    }
}

let lidFlagIcon = null;

function getLidFlagIcon() {
    if (lidFlagIcon || typeof document === "undefined" || !document.createElement) {
        return lidFlagIcon;
    }

    const canvas = document.createElement("canvas");
    if (!canvas.getContext) return null;

    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#E2B36C";
    ctx.fillStyle = "#E2B36C";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, 28);
    ctx.lineTo(8, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, 5);
    ctx.lineTo(26, 11);
    ctx.lineTo(8, 17);
    ctx.closePath();
    ctx.fill();
    lidFlagIcon = canvas;
    return canvas;
}

function eventSeries(samples, events) {
    const data = samples.map(() => null);
    const meta = samples.map(() => null);

    for (const event of events || []) {
        if (event.type !== "lid") continue;

        let index = -1;
        let best = Infinity;
        samples.forEach((sample, i) => {
            const delta = Math.abs(sample.timestamp - event.timestamp);
            if (delta < best) {
                best = delta;
                index = i;
            }
        });

        if (index < 0 || best > 8 * 60 * 1000) continue;
        const y = Number.isFinite(samples[index].dome) ? samples[index].dome : samples[index].meat;
        if (!Number.isFinite(y)) continue;
        data[index] = y;
        meta[index] = event;
    }

    return { data, meta };
}

function lidEventDataset(samples, events) {
    const series = eventSeries(samples, events || []);
    const icon = getLidFlagIcon();

    return {
        label: "Lid",
        data: series.data,
        eventMeta: series.meta,
        isEvent: true,
        pointStyle: icon || "triangle",
        pointRadius: series.data.map(value => value == null ? 0 : 8),
        pointHoverRadius: series.data.map(value => value == null ? 0 : 11),
        borderWidth: 0,
        showLine: false
    };
}

function nearestReferenceSample(history, timestamp, toleranceMs) {
    let best = null;
    let bestDelta = Infinity;

    for (const sample of history || []) {
        if (!Number.isFinite(sample?.timestamp)) continue;
        const delta = Math.abs(sample.timestamp - timestamp);
        if (delta < bestDelta) {
            best = sample;
            bestDelta = delta;
        }
    }

    return bestDelta <= toleranceMs ? best : null;
}

function referenceDatasets(samples, cookStartedAt, likeSessionId) {
    if (!likeSessionId || typeof appState === "undefined") return [];

    const reference = appState.sessions?.find(session => session.id === likeSessionId);
    const start = Date.parse(cookStartedAt);
    const referenceStart = Date.parse(reference?.startedAt);
    if (!reference?.temperatureHistory?.length || Number.isNaN(start) || Number.isNaN(referenceStart)) {
        return [];
    }

    const dome = [];
    const meat = [];
    let any = false;

    for (const sample of samples) {
        const match = nearestReferenceSample(
            reference.temperatureHistory,
            referenceStart + (sample.timestamp - start),
            4 * 60 * 1000
        );
        dome.push(match && Number.isFinite(match.dome) ? match.dome : null);
        meat.push(match && Number.isFinite(match.meat) ? match.meat : null);
        if (match) any = true;
    }

    if (!any) return [];

    const dashed = (label, color, data) => ({
        label,
        data,
        isExtra: true,
        borderColor: color,
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        tension: .25,
        fill: false
    });

    return [
        dashed("Last dome", "rgba(229,169,61,.55)", dome),
        dashed("Last core", "rgba(77,182,165,.55)", meat)
    ];
}

function renderHistoryDetailChart() {

    const session =
        getOpenHistorySession();

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
    if (historyChartIsCurrent(historyDetailChart, canvas, session, rawSampleCount)) {
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
                    targetDataset("Core target", coreTarget, coreColor),
                    lidEventDataset(samples, session.events)
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
                        display: false
                    },

                    tooltip: {
                        filter: chartTooltipFilter,
                        callbacks: {
                            label: chartTooltipLabel
                        }
                    }
                },

                onClick(event, elements) {
                    openLidEventFromChart(this, elements, session.id);
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
    historyDetailChart._bbqDomeTarget = session.domeTarget;
    historyDetailChart._bbqMeatTarget = session.meatTarget;
    historyDetailChart._bbqEvents = eventSignature(session);

    bindChartTooltipDismiss(canvas, () => historyDetailChart);
}

let chartTooltipDismissBound = false;

function hideChartTooltip(chart) {
    if (!chart?.tooltip || chart.tooltip.opacity === 0) {
        return;
    }

    chart.setActiveElements([]);
    chart.tooltip.setActiveElements([], { x: 0, y: 0 });
    chart.update("none");
}

// Index tooltips have no "finger left the chart" event, so they stay open and
// look like a stuck data popup. Hide on an outside tap, and shortly after the
// finger lifts.
function bindChartTooltipDismiss(canvas, getChart) {
    if (!canvas || canvas.dataset.tooltipBound) {
        return;
    }

    canvas.dataset.tooltipBound = "true";
    canvas._chartGetter = getChart;
    canvas.addEventListener("pointerup", () => {
        clearTimeout(canvas._tooltipHide);
        canvas._tooltipHide = setTimeout(() => hideChartTooltip(getChart()), 1200);
    });

    if (chartTooltipDismissBound) {
        return;
    }

    chartTooltipDismissBound = true;
    document.addEventListener("pointerdown", event => {
        document.querySelectorAll("canvas[data-tooltip-bound]").forEach(boundCanvas => {
            if (boundCanvas.contains(event.target)) {
                return;
            }

            clearTimeout(boundCanvas._tooltipHide);
            hideChartTooltip(boundCanvas._chartGetter?.());
        });
    });
}

/* ==========================================================
   DOME SUMMARY + COOK JOURNAL (rating, notes, photos)
========================================================== */

const MAX_COOK_PHOTOS = 6;
const COOK_PHOTO_MAX_EDGE = 1280;
const COOK_PHOTO_QUALITY = 0.8;
let journalSaveTimer = null;

// Fall back to the browser dialogs if dialogs.js is missing (e.g. not yet deployed),
// so an action never fails silently.
function askText(title, value, options) {
    return typeof uiPrompt === "function"
        ? uiPrompt(title, value, options)
        : Promise.resolve(prompt(title, value));
}

function askConfirm(title, message, options) {
    return typeof uiConfirm === "function"
        ? uiConfirm(title, message, options)
        : Promise.resolve(confirm(`${title}\n\n${message}`));
}

function showNotice(title, message) {
    if (typeof uiAlert === "function") {
        return uiAlert(title, message);
    }
    alert(`${title}\n\n${message}`);
    return Promise.resolve();
}

function escapeHtmlText(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function renderStars(rating) {
    return [1, 2, 3, 4, 5]
        .map(n => n <= rating ? "★" : "☆")
        .join("");
}

function renderLidEventList(session) {
    const events = (session?.events || []).filter(event => event.type === "lid");
    if (!events.length) return "";

    return `
    <div class="card">
        <h3>Lid openings</h3>
        ${events.map(event => `
            <button type="button" class="event-flag" onclick="explainLidEvent('${session.id}', '${event.id}')">
                <span class="event-flag-title">Lid · ${new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <small>${escapeHtmlText(event.reason || "Add why it was opened")}</small>
            </button>
        `).join("")}
    </div>`;
}

async function explainLidEvent(sessionId, eventId) {
    const session = findSession(sessionId) || (typeof getCurrentSession === "function" ? getCurrentSession() : null);
    const event = session?.events?.find(item => item.id === eventId);
    if (!event) return;

    const reason = await askText(
        "Why was the lid opened?",
        event.reason || "",
        { placeholder: "Checked the bark, added wood…" }
    );
    if (!reason) return;

    event.reason = reason;
    touchSession(session);
    render();
}

async function cookLikeThis(sessionId) {
    const source = findSession(sessionId);
    if (!source || typeof startCookSession !== "function") return;

    if (appState.cook?.active) {
        const confirmed = await askConfirm(
            "Start a new cook?",
            "The current cook will be saved first. The new one uses the same targets and phases.",
            { confirmText: "Start" }
        );
        if (!confirmed) return;
        finishCookSession();
    }

    const settings = settingsFromCook(source);
    appState.cook.active = true;
    appState.cook.name = settings.name;
    appState.cook.recipe = settings.recipe;
    appState.cook.domeTarget = settings.domeTarget;
    appState.cook.meatTarget = settings.meatTarget;
    appState.cook.phases = settings.phases;
    appState.cook.phase = 0;
    appState.cook.completedPhases = [];
    appState.cook.duration = "";
    appState.cook.startedAt = new Date().toISOString();
    appState.cook.lastPhaseChange = appState.cook.startedAt;
    appState.cook.likeSessionId = settings.likeSessionId;

    if (typeof syncWakeLockState === "function") {
        syncWakeLockState();
    }

    startCookSession();
    appState.selectedHistory = null;
    appState.screen = "dashboard";

    if (typeof saveAppState === "function") {
        saveAppState();
    }

    render();
}

function loadShareImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Unable to load photo"));
        image.src = src;
    });
}

const SHARE_MAX_PHOTOS = 3;

async function sharePhotos(session) {
    const photos = (session.photos || []).slice(0, SHARE_MAX_PHOTOS);
    const loaded = await Promise.all(photos.map(loadSharePhoto));
    return loaded.filter(Boolean);
}

async function loadSharePhoto(photo) {
    if (!photo) return null;

    try {
        if (String(photo).startsWith("data:")) {
            return await loadShareImage(photo);
        }

        const src = getPhotoSrc(photo);
        if (!src) return null;
        const response = await fetch(src);
        if (!response.ok) return null;
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        try {
            return await loadShareImage(url);
        } finally {
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.warn("Share photo skipped", error);
        return null;
    }
}

const SHARE_DOME_COLOR = "#E5A93D";
const SHARE_CORE_COLOR = "#4DB6A5";

function shareDuration(session) {
    if (session.duration) return session.duration;
    const samples = session.temperatureHistory || [];
    if (samples.length < 2) return "";
    const minutes = Math.round((samples[samples.length - 1].timestamp - samples[0].timestamp) / 60000);
    if (!(minutes > 0)) return "";
    return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}

function shareDomeAverage(session) {
    const dome = (session.temperatureHistory || []).map(sample => sample.dome).filter(Number.isFinite);
    return dome.length ? dome.reduce((sum, value) => sum + value, 0) / dome.length : null;
}

function formatShareAxisTime(ms) {
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function drawShareChart(ctx, session, x, y, width, height) {
    ctx.fillStyle = "#23201C";
    roundedRect(ctx, x, y, width, height, 20);
    ctx.fill();

    const samples = (session.temperatureHistory || [])
        .filter(sample => Number.isFinite(sample.dome) || Number.isFinite(sample.meat));

    ctx.font = "500 18px sans-serif";
    ctx.textBaseline = "middle";
    [["Dome", SHARE_DOME_COLOR, 0], ["Core", SHARE_CORE_COLOR, 110], ["Lid open", "#F5F4F0", 220]].forEach(([label, color, dx]) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + 32 + dx, y + 30, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#9DA5A5";
        ctx.fillText(label, x + 46 + dx, y + 30);
    });
    ctx.textBaseline = "alphabetic";

    if (samples.length < 2) return;

    const plotX = x + 72;
    const plotY = y + 60;
    const plotW = width - 72 - 28;
    const plotH = height - 60 - 44;
    const t0 = samples[0].timestamp;
    const span = Math.max(1, samples[samples.length - 1].timestamp - t0);
    const targets = [session.domeTarget, session.meatTarget].filter(Number.isFinite);
    const values = samples.flatMap(sample => [sample.dome, sample.meat].filter(Number.isFinite)).concat(targets);
    const max = Math.ceil((Math.max(...values) + 5) / 20) * 20;
    const min = Math.max(0, Math.floor((Math.min(...values) - 5) / 20) * 20);
    const range = Math.max(1, max - min);
    const px = timestamp => plotX + ((timestamp - t0) / span) * plotW;
    const py = value => plotY + plotH - ((value - min) / range) * plotH;

    ctx.font = "400 16px sans-serif";
    ctx.lineWidth = 1;
    for (let value = min; value <= max; value += 20) {
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.moveTo(plotX, py(value));
        ctx.lineTo(plotX + plotW, py(value));
        ctx.stroke();
        ctx.fillStyle = "#9DA5A5";
        ctx.textAlign = "right";
        ctx.fillText(String(value), plotX - 12, py(value) + 5);
    }

    ctx.textAlign = "left";
    ctx.fillText("0h", plotX, y + height - 14);
    ctx.textAlign = "right";
    ctx.fillText(formatShareAxisTime(span), plotX + plotW, y + height - 14);
    ctx.textAlign = "left";

    if (Number.isFinite(session.meatTarget)) {
        ctx.save();
        ctx.setLineDash([10, 8]);
        ctx.strokeStyle = SHARE_CORE_COLOR;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(plotX, py(session.meatTarget));
        ctx.lineTo(plotX + plotW, py(session.meatTarget));
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = SHARE_CORE_COLOR;
        ctx.textAlign = "right";
        ctx.fillText(`Core target ${session.meatTarget.toFixed(0)}°C`, plotX + plotW, py(session.meatTarget) - 8);
        ctx.textAlign = "left";
    }

    const plot = (key, color) => {
        ctx.beginPath();
        let started = false;
        samples.forEach(sample => {
            if (!Number.isFinite(sample[key])) return;
            if (!started) {
                ctx.moveTo(px(sample.timestamp), py(sample[key]));
                started = true;
            } else {
                ctx.lineTo(px(sample.timestamp), py(sample[key]));
            }
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.stroke();
    };
    plot("dome", SHARE_DOME_COLOR);
    plot("meat", SHARE_CORE_COLOR);

    (session.events || []).forEach(event => {
        if (event.type !== "lid" || event.timestamp < t0 || event.timestamp > t0 + span) return;
        const ex = px(event.timestamp);
        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = "rgba(245,244,240,0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ex, plotY);
        ctx.lineTo(ex, plotY + plotH);
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = "#171511";
        ctx.strokeStyle = "#F5F4F0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ex, plotY + 4, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });
}

function drawShareCover(ctx, photo, x, y, width, height, radius) {
    ctx.save();
    roundedRect(ctx, x, y, width, height, radius);
    ctx.clip();
    const scale = Math.max(width / photo.width, height / photo.height);
    const w = photo.width * scale;
    const h = photo.height * scale;
    ctx.drawImage(photo, x + (width - w) / 2, y + (height - h) / 2, w, h);
    ctx.restore();
}

function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}

async function renderShareCard(session) {
    const W = 1080;
    const H = 1350;
    const M = 40;
    const innerW = W - M * 2;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const photos = await sharePhotos(session);
    const peaks = cookPeaks(session);

    ctx.fillStyle = "#171511";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#E2B36C";
    ctx.font = "700 20px sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("HERMANOS", M, 58);
    ctx.letterSpacing = "0px";

    const name = (session.name || session.recipe || "Cook").slice(0, 28);
    const when = session.startedAt
        ? new Date(session.startedAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "";

    const heroY = 84;
    const thumbs = photos.slice(1);
    const heroH = photos.length === 0 ? 220 : thumbs.length ? 520 : 760;
    let cursor = heroY;

    if (photos.length) {
        drawShareCover(ctx, photos[0], M, heroY, innerW, heroH, 24);
        const fade = ctx.createLinearGradient(0, heroY + heroH - 240, 0, heroY + heroH);
        fade.addColorStop(0, "rgba(23,21,17,0)");
        fade.addColorStop(1, "rgba(23,21,17,0.9)");
        ctx.save();
        roundedRect(ctx, M, heroY, innerW, heroH, 24);
        ctx.clip();
        ctx.fillStyle = fade;
        ctx.fillRect(M, heroY + heroH - 240, innerW, 240);
        ctx.restore();
    } else {
        ctx.fillStyle = "#23201C";
        roundedRect(ctx, M, heroY, innerW, heroH, 24);
        ctx.fill();
    }

    ctx.fillStyle = "#E2B36C";
    ctx.font = "800 64px sans-serif";
    ctx.fillText(name, M + 32, heroY + heroH - 78);
    ctx.fillStyle = "#D8D6D0";
    ctx.font = "400 30px sans-serif";
    ctx.fillText(when, M + 32, heroY + heroH - 30);
    if (session.rating) {
        ctx.fillStyle = "#E2B36C";
        ctx.font = "400 40px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(renderStars(session.rating), M + innerW - 32, heroY + heroH - 30);
        ctx.textAlign = "left";
    }
    cursor += heroH + 16;

    if (thumbs.length) {
        const gap = 16;
        const thumbW = (innerW - gap * (thumbs.length - 1)) / thumbs.length;
        thumbs.forEach((photo, index) => {
            drawShareCover(ctx, photo, M + index * (thumbW + gap), cursor, thumbW, 180, 20);
        });
        cursor += 180 + 20;
    }

    const duration = shareDuration(session);
    const domeAvg = shareDomeAverage(session);
    const stats = [
        {
            label: "Core peak",
            value: peaks.meat != null ? `${peaks.meat.toFixed(0)}°C` : "—",
            sub: Number.isFinite(session.meatTarget) ? `Target ${session.meatTarget.toFixed(0)}°C` : "",
            color: SHARE_CORE_COLOR
        },
        {
            label: "Dome avg",
            value: domeAvg != null ? `${domeAvg.toFixed(0)}°C` : "—",
            sub: "",
            color: SHARE_DOME_COLOR
        },
        { label: "Total cook time", value: duration || "—", sub: "", color: "#F5F4F0" }
    ];
    const tileGap = 16;
    const tileW = (innerW - tileGap * (stats.length - 1)) / stats.length;
    const tileH = 150;
    stats.forEach((stat, index) => {
        const x = M + index * (tileW + tileGap);
        ctx.fillStyle = "#23201C";
        roundedRect(ctx, x, cursor, tileW, tileH, 20);
        ctx.fill();
        ctx.fillStyle = "#9DA5A5";
        ctx.font = "600 22px sans-serif";
        ctx.fillText(stat.label, x + 24, cursor + 42);
        ctx.fillStyle = stat.color;
        ctx.font = "800 48px sans-serif";
        ctx.fillText(stat.value, x + 24, cursor + 100);
        if (stat.sub) {
            ctx.fillStyle = "#9DA5A5";
            ctx.font = "400 20px sans-serif";
            ctx.fillText(stat.sub, x + 24, cursor + 132);
        }
    });
    cursor += tileH + 20;

    const footerY = H - 28;
    drawShareChart(ctx, session, M, cursor, innerW, footerY - 40 - cursor);

    ctx.fillStyle = "#9DA5A5";
    ctx.font = "400 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Hermanos Grill Companion", W / 2, footerY);
    ctx.textAlign = "left";

    return new Promise(resolve => canvas.toBlob(blob => resolve(blob), "image/png"));
}

function downloadShareCard(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareCook(sessionId) {
    const session = findSession(sessionId);
    if (!session) return;

    const text = shareCookText(session);
    const filename = `${(session.name || "cook").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || "cook"}.png`;

    try {
        const blob = await renderShareCard(session);
        if (!blob) throw new Error("Empty share card");

        const file = new File([blob], filename, { type: "image/png" });
        const canShareFile = navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }));

        if (canShareFile) {
            await navigator.share({
                files: [file],
                title: session.name || "Cook",
                text
            });
            return;
        }

        downloadShareCard(blob, filename);
        if (navigator.share) {
            await navigator.share({ title: session.name || "Cook", text });
            return;
        }

        showNotice("Cook card saved", "Sharing isn't available in this browser, so the card was downloaded.");
    } catch (error) {
        if (error?.name === "AbortError") return;
        console.warn("Share failed", error);
        showNotice("Couldn't share", "The cook card could not be shared.");
    }
}

function renderDomeSummaryCard(session) {
    if (typeof summarizeDomeSession !== "function") return "";

    const summary = summarizeDomeSession(
        session.temperatureHistory,
        Number(session.domeTarget) || null
    );
    if (!summary) return "";

    const lidMinutes = Math.round(summary.lidOpenMs / 60000);

    return `
    <div class="card">
        <h3>Dome control</h3>
        <div class="history-metrics">
            <div class="history-metric dome-metric">
                <span class="history-metric-label">Average dome</span>
                <strong>${summary.meanDome.toFixed(0)}°C</strong>
                <small>${summary.timeInRangePct != null ? `${summary.timeInRangePct}% within ±5° of ${session.domeTarget}°C` : "No dome target"}</small>
            </div>
            <div class="history-metric">
                <span class="history-metric-label">Lid opened</span>
                <strong>${summary.lidOpens}×</strong>
                <small>${summary.lidOpens ? `about ${lidMinutes} min in total` : "Not detected"}</small>
            </div>
        </div>
    </div>`;
}

function renderJournalCard(session) {
    const photos = session.photos || [];
    const id = session.id;

    return `
    <div class="card journal-card">
        <h3>Cook journal</h3>

        <p class="journal-label">Rating</p>
        <div class="journal-stars" role="group" aria-label="Rating">
            ${[1, 2, 3, 4, 5].map(n => `
                <button type="button"
                    class="journal-star ${n <= (session.rating || 0) ? "on" : ""}"
                    aria-label="${n} star${n > 1 ? "s" : ""}"
                    onclick="setCookRating('${id}', ${n})">${n <= (session.rating || 0) ? "★" : "☆"}</button>
            `).join("")}
        </div>

        <p class="journal-label">Notes</p>
        <textarea class="journal-input" rows="4"
            placeholder="Rub, wood, vent settings, wrap time, how it turned out…"
            oninput="updateCookJournal('${id}', 'notes', this.value)">${escapeHtmlText(session.notes)}</textarea>

        <p class="journal-label">Next time</p>
        <textarea class="journal-input" rows="2"
            placeholder="What would you change?"
            oninput="updateCookJournal('${id}', 'improve', this.value)">${escapeHtmlText(session.improve)}</textarea>

        <p class="journal-label">Photos (${photos.length}/${MAX_COOK_PHOTOS})</p>
        <div class="journal-photos">
            ${photos.map((src, index) => `
                <div class="journal-photo">
                    <img src="${getPhotoSrc(src)}" alt="Cook photo ${index + 1}">
                    <button type="button" aria-label="Remove photo"
                        onclick="removeCookPhoto('${id}', ${index})">×</button>
                </div>
            `).join("")}
        </div>

        ${photos.length < MAX_COOK_PHOTOS ? `
        <label class="button secondary journal-add-photo">
            Add photo
            <input type="file" accept="image/*" hidden
                onchange="addCookPhoto('${id}', this)">
        </label>` : ""}
    </div>`;
}

function touchSession(session) {
    session.updatedAt = new Date().toISOString();
    saveSessions();
}

function findSession(id) {
    return appState.sessions.find(s => s.id === id);
}

function setCookRating(id, rating) {
    const session = findSession(id);
    if (!session) return;

    session.rating = session.rating === rating ? null : rating;
    touchSession(session);
    render();
}

// Debounced so typing doesn't re-upload the whole session on every keystroke.
function updateCookJournal(id, field, value) {
    const session = findSession(id);
    if (!session) return;

    session[field] = value;
    session.updatedAt = new Date().toISOString();

    clearTimeout(journalSaveTimer);
    journalSaveTimer = setTimeout(saveSessions, 800);
}

function resizePhotoToBlob(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            const scale = Math.min(1, COOK_PHOTO_MAX_EDGE / Math.max(image.width, image.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);
            canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            canvas.toBlob(
                blob => blob ? resolve(blob) : reject(new Error("Unable to encode image")),
                "image/jpeg",
                COOK_PHOTO_QUALITY
            );
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Unable to read image"));
        };

        image.src = url;
    });
}

function getPhotoEndpoint(photoId) {
    const base = typeof getCookStorageUrl === "function" ? getCookStorageUrl() : null;
    return base ? base.replace("/api/cook-sessions", `/api/photos/${photoId}`) : null;
}

// Photos saved by the first journal version are inline data URLs; newer ones are Pi file ids.
function getPhotoSrc(photo) {
    if (String(photo).startsWith("data:")) return photo;

    const endpoint = getPhotoEndpoint(photo);
    if (!endpoint) return "";

    const token = appState.network?.apiToken;
    return token ? `${endpoint}?token=${encodeURIComponent(token)}` : endpoint;
}

function deletePhotoFromPi(photo) {
    if (String(photo).startsWith("data:")) return;

    const endpoint = getPhotoEndpoint(photo);
    if (!endpoint) return;

    fetch(endpoint, { method: "DELETE", headers: getCookStorageHeaders() })
        .catch(error => console.warn("Photo could not be removed from the Pi", error));
}

async function addCookPhoto(id, input) {
    const session = findSession(id);
    const file = input.files && input.files[0];
    if (!session || !file) return;

    session.photos = session.photos || [];
    if (session.photos.length >= MAX_COOK_PHOTOS) return;

    const photoId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const endpoint = getPhotoEndpoint(photoId);

    if (!endpoint) {
        input.value = "";
        showNotice("Photo not saved", "Set the Pi's server address in Settings to save photos.");
        return;
    }

    try {
        const blob = await resizePhotoToBlob(file);
        const response = await fetch(endpoint, {
            method: "PUT",
            headers: getCookStorageHeaders({ "Content-Type": "image/jpeg" }),
            body: blob
        });

        if (!response.ok) {
            const error = new Error(`Pi returned ${response.status}`);
            error.status = response.status;
            throw error;
        }

        session.photos.push(photoId);
        touchSession(session);
        render();
    } catch (error) {
        console.warn("Photo could not be added", error);

        let reason = "The Pi could not be reached. Check the connection and try again.";
        if (error.status === 404) {
            reason = "The Pi doesn't know about photos yet. Update the Pi and restart the storage service (bbq-storage).";
        } else if (error.status === 401) {
            reason = "The Pi rejected the API token. Check it in Settings.";
        } else if (error.status) {
            reason = `The Pi returned an error (${error.status}).`;
        } else if (error.message === "Unable to read image") {
            reason = "This image format could not be read. Try a different photo.";
        }

        showNotice("Photo not saved", reason);
    } finally {
        input.value = "";
    }
}

function removeCookPhoto(id, index) {
    const session = findSession(id);
    if (!session || !session.photos) return;

    const [removed] = session.photos.splice(index, 1);
    deletePhotoFromPi(removed);
    touchSession(session);
    render();
}
