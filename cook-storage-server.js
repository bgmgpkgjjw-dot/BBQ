const http = require("http");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const port = Number(process.env.BBQ_STORAGE_PORT || 8090);
const dataDirectory = process.env.BBQ_DATA_DIR || "/home/william/bbq-data";
const dbFile = path.join(dataDirectory, "bbq.db");
const legacyJsonFile = path.join(dataDirectory, "cook-sessions.json");

fs.mkdirSync(dataDirectory, { recursive: true });

const dbAlreadyExisted = fs.existsSync(dbFile);
const db = new Database(dbFile);
db.pragma("journal_mode = WAL");
db.exec(`
    CREATE TABLE IF NOT EXISTS cook_sessions (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_cook_sessions_updated_at ON cook_sessions (updated_at);
`);

// One-time import from the old JSON file so existing history isn't lost.
if (!dbAlreadyExisted && fs.existsSync(legacyJsonFile)) {
    try {
        const legacyData = JSON.parse(fs.readFileSync(legacyJsonFile, "utf8"));
        const legacySessions = Array.isArray(legacyData.sessions) ? legacyData.sessions : [];
        const importSession = db.prepare(
            "INSERT OR REPLACE INTO cook_sessions (id, data, updated_at) VALUES (?, ?, ?)"
        );
        const importAll = db.transaction(sessions => {
            for (const session of sessions) {
                if (session && session.id) {
                    const updatedAt = session.updatedAt || session.finishedAt || session.startedAt || null;
                    importSession.run(session.id, JSON.stringify(session), updatedAt);
                }
            }
        });
        importAll(legacySessions);
        fs.renameSync(legacyJsonFile, `${legacyJsonFile}.migrated`);
        console.log(`Migrated ${legacySessions.length} cook session(s) from ${legacyJsonFile} into SQLite`);
    } catch (error) {
        console.error("Unable to migrate legacy cook-sessions.json", error);
    }
}

const selectAllStatement = db.prepare("SELECT data FROM cook_sessions ORDER BY rowid");
const upsertStatement = db.prepare(
    "INSERT INTO cook_sessions (id, data, updated_at) VALUES (?, ?, ?) " +
    "ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at"
);
const upsertMany = db.transaction(sessions => {
    for (const session of sessions) {
        const updatedAt = session.updatedAt || session.finishedAt || session.startedAt || null;
        upsertStatement.run(session.id, JSON.stringify(session), updatedAt);
    }
});

function readSessions() {
    return selectAllStatement.all().map(row => JSON.parse(row.data));
}

function sendJson(response, status, body) {
    response.writeHead(status, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });
    response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
    if (request.method === "OPTIONS") {
        sendJson(response, 204, {});
        return;
    }

    if (request.url !== "/api/cook-sessions") {
        sendJson(response, 404, { error: "Not found" });
        return;
    }

    if (request.method === "GET") {
        sendJson(response, 200, { sessions: readSessions() });
        return;
    }

    if (request.method !== "PUT") {
        sendJson(response, 405, { error: "Method not allowed" });
        return;
    }

    let body = "";
    request.setEncoding("utf8");
    request.on("data", chunk => {
        body += chunk;
        if (body.length > 10 * 1024 * 1024) {
            request.destroy();
        }
    });
    request.on("end", () => {
        try {
            const payload = JSON.parse(body);
            if (!Array.isArray(payload.sessions)) {
                sendJson(response, 400, { error: "sessions must be an array" });
                return;
            }

            const validSessions = payload.sessions.filter(session => session && session.id);
            upsertMany(validSessions);
            sendJson(response, 200, { sessions: readSessions() });
        } catch (error) {
            console.error("Unable to save cook backup", error);
            sendJson(response, 400, { error: "Invalid cook backup" });
        }
    });
});

server.listen(port, "0.0.0.0", () => {
    console.log(`Cook storage listening on port ${port}; database: ${dbFile}`);
});