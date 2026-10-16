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
        session.domeTarget = appState.cook.domeTarget;
        session.meatTarget = appState.cook.meatTarget;

        if (typeof saveSessions === "function") {
            saveSessions();
        }
    }


    appState.selectedHistory =
        session;


    render();


}

function historyDetailView() {


    const selected =
        appState.selectedHistory;


    if (!selected) {

        return historyView();

    }

    // Prefer the live object so journal edits show after a Pi sync replaced the reference.
    const session =
        appState.sessions.find(s => s.id === selected.id) || selected;



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
                        display: false
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
