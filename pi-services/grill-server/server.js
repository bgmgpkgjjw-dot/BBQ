const { WebSocketServer } = require("ws");
const WebSocket = require("ws");
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.BBQ_GRILL_PORT || 8080);
const apiToken = process.env.BBQ_API_TOKEN || null;
const dataDirectory = process.env.BBQ_DATA_DIR || "/home/william/bbq-data";
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // keep 30 days of raw readings

fs.mkdirSync(dataDirectory, { recursive: true });
const db = new Database(path.join(dataDirectory, "bbq.db"));
db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");
db.exec(`
    CREATE TABLE IF NOT EXISTS temperature_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        dome INTEGER,
        probe1 INTEGER,
        probe2 INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_temperature_log_timestamp ON temperature_log (timestamp);
`);
const insertReading = db.prepare(
    "INSERT INTO temperature_log (timestamp, dome, probe1, probe2) VALUES (?, ?, ?, ?)"
);
const pruneOldReadings = db.prepare("DELETE FROM temperature_log WHERE timestamp < ?");

function recordReading(data) {
    try {
        insertReading.run(
            Date.now(),
            data.dome ?? null,
            data.probe1 ?? null,
            data.probe2 ?? null
        );
    } catch (error) {
        console.error("Unable to record temperature reading", error);
    }
}

function prune() {
    try {
        pruneOldReadings.run(Date.now() - RETENTION_MS);
    } catch (error) {
        console.error("Unable to prune old temperature readings", error);
    }
}
prune();
setInterval(prune, 24 * 60 * 60 * 1000);

const wss = new WebSocketServer({ port });
// Placeholder until real data arrives from btgateway; null explicitly signals "no reading yet"
// so the client clears any stale display instead of showing a fake/frozen temperature.
let latestData = {
    dome: null,
    probe1: null,
    probe2: null,
};
let lastReceivedAt = 0;
const READING_STALE_MS = 10000;

console.log(`Grill server starting on port ${port}${apiToken ? " (token required)" : " (no token configured)"}`);

// Subscribe to btgateway
let btgw = null;
function connectToBtgateway() {
    console.log("Connecting to btgateway on :8765...");
    btgw = new WebSocket("ws://localhost:8765");

    btgw.onopen = () => {
        console.log("Connected to btgateway");
    };

    btgw.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            latestData = data;
            lastReceivedAt = Date.now();
            recordReading(data);
            console.log("Received from btgateway:", data);
        } catch (e) {
            console.error("Invalid JSON from btgateway:", e);
        }
    };

    btgw.onerror = (error) => {
        console.error("btgateway error:", error);
    };

    btgw.onclose = () => {
        console.log("Disconnected from btgateway, reconnecting in 5s...");
        setTimeout(connectToBtgateway, 5000);
    };
}

// Start listening to btgateway
connectToBtgateway();

// Broadcast to all PWA clients
setInterval(() => {
    // Once btgateway has gone quiet (probe off/out of range), stop re-sending the
    // cached reading as if it were live - broadcast nulls instead.
    const isStale = Date.now() - lastReceivedAt > READING_STALE_MS;
    const payload = isStale
        ? { dome: null, probe1: null, probe2: null }
        : latestData;

    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(payload));
        }
    });
}, 1000);

wss.on("connection", (ws, request) => {
    if (apiToken) {
        const requestUrl = new URL(request.url, "http://localhost");
        const providedToken = requestUrl.searchParams.get("token");
        if (providedToken !== apiToken) {
            console.warn("PWA client rejected: invalid or missing token");
            ws.close(4001, "Unauthorized");
            return;
        }
    }

    console.log("PWA client connected");
    ws.on("close", () => console.log("PWA client disconnected"));
});

console.log(`WebSocket server listening on ws://0.0.0.0:${port}`);
