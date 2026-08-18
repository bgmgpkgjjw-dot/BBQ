const http = require("http");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const port = Number(process.env.BBQ_STORAGE_PORT || 8090);
const dataDirectory = process.env.BBQ_DATA_DIR || "/home/william/bbq-data";
const dbFile = path.join(dataDirectory, "bbq.db");
const legacyJsonFile = path.join(dataDirectory, "cook-sessions.json");
const apiToken = process.env.BBQ_API_TOKEN || null;
const openRouterApiKey = process.env.OPENROUTER_API_KEY || null;

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

try {
    db.exec("ALTER TABLE cook_sessions ADD COLUMN device_id TEXT");
} catch (error) {
    if (!/duplicate column/i.test(error.message)) {
        throw error;
    }
}

// Shared with grill-server, which writes into this table independent of any connected PWA client.
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
    "INSERT INTO cook_sessions (id, data, updated_at, device_id) VALUES (?, ?, ?, ?) " +
    "ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at, device_id = excluded.device_id"
);
const upsertMany = db.transaction((sessions, deviceId) => {
    for (const session of sessions) {
        const updatedAt = session.updatedAt || session.finishedAt || session.startedAt || null;
        upsertStatement.run(session.id, JSON.stringify(session), updatedAt, deviceId || null);
    }
});

function readSessions() {
    return selectAllStatement.all().map(row => JSON.parse(row.data));
}

const selectReadingsStatement = db.prepare(
    "SELECT timestamp, dome, probe1, probe2 FROM temperature_log " +
    "WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC"
);

function readTemperatureLog(sinceMs, untilMs) {
    return selectReadingsStatement.all(sinceMs, untilMs);
}

function isAuthorized(request) {
    if (!apiToken) {
        return true;
    }
    return request.headers["x-bbq-token"] === apiToken;
}

function buildRecipePrompt(ingredients, category) {
    return `
        You are a professional Kamado BBQ chef. Generate exactly 3 recipes using the ingredients and style below.

        RECIPE MIX (strict):
        - 2 of the 3 recipes must be classic, well-known, low-effort Kamado dishes — the kind of recipes that show up constantly on Big Green Egg, Kamado Joe, and Smokey Goodness content (e.g. pulled pork, ribs, chicken thighs, smoked salmon, pizza, burgers). Simple ingredient lists, minimal steps, no unusual techniques.
        - 1 of the 3 recipes may be more "surprising" — a twist on a classic or a less common cut/method — but it must still be realistic for a home Kamado grill with normal supermarket ingredients. No fusion cuisine, no molecular techniques, no hard-to-find ingredients.

        LABOR CONSTRAINT:
        - Prefer recipes with 5-8 steps and default difficulty "Easy" or "Medium." Avoid multi-day brines/marinades or techniques requiring special equipment unless the recipe style explicitly calls for it.

        TEMPERATURE RULES:
        - "dome_temperature" = required dome/cooking temperature in Celsius, always filled in (e.g. "180°C"). Never leave blank.
        - "target_temperature" = required internal meat temperature in Celsius, or null if not applicable.

        PHASES:
        - Include multiple phases only when the recipe naturally has them (e.g. pulled pork: Smoke → Wrap → Finish; brisket: Smoke → Wrap → Rest; ribs: Smoke → Wrap → Sauce).
        - Simple recipes (burgers, veg, fish) should have a single phase.

        Available ingredients: ${ingredients}
        Recipe style: ${category}

        Return ONLY valid JSON, no commentary, in this exact format:

        [
        {
            "title": "",
            "description": "",
            "dome_temperature": "180°C",
            "target_temperature": "72°C",
            "duration": "45 minutes",
            "difficulty": "Easy",
            "phases": [
            { "name": "Smoke", "dome_temperature": 120, "target_temperature": 75 },
            { "name": "Wrap", "dome_temperature": 130, "target_temperature": 92 }
            ],
            "ingredients": [],
            "steps": []
        }
        ]
    `;
}

async function generateRecipes(ingredients, category) {
    if (!openRouterApiKey) {
        throw new Error("AI recipes are not configured on this server (missing OPENROUTER_API_KEY)");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "X-Title": "Hermanos Grill Companion"
        },
        body: JSON.stringify({
            model: "openrouter/free",
            messages: [{ role: "user", content: buildRecipePrompt(ingredients, category) }]
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(JSON.stringify(data));
    }

    let text = data?.choices?.[0]?.message?.content;
    if (!text) {
        throw new Error(JSON.stringify(data));
    }

    text = text.replace(/```json|```/g, "");
    return JSON.parse(text);
}

function sendJson(response, status, body) {
    response.writeHead(status, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-BBQ-Token, X-BBQ-Device-Id"
    });
    response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
    if (request.method === "OPTIONS") {
        sendJson(response, 204, {});
        return;
    }

    const requestUrl = new URL(request.url, "http://localhost");

    if (!isAuthorized(request)) {
        sendJson(response, 401, { error: "Unauthorized" });
        return;
    }

    if (requestUrl.pathname === "/api/temperature-log") {
        if (request.method !== "GET") {
            sendJson(response, 405, { error: "Method not allowed" });
            return;
        }

        const since = Date.parse(requestUrl.searchParams.get("since"));
        const until = Date.parse(requestUrl.searchParams.get("until"));
        if (Number.isNaN(since)) {
            sendJson(response, 400, { error: "since must be a valid date" });
            return;
        }

        sendJson(response, 200, {
            readings: readTemperatureLog(since, Number.isNaN(until) ? Date.now() : until)
        });
        return;
    }

    if (requestUrl.pathname === "/api/ai/recipes") {
        if (request.method !== "POST") {
            sendJson(response, 405, { error: "Method not allowed" });
            return;
        }

        let requestBody = "";
        request.setEncoding("utf8");
        request.on("data", chunk => {
            requestBody += chunk;
            if (requestBody.length > 10 * 1024) {
                request.destroy();
            }
        });
        request.on("end", async () => {
            try {
                const { ingredients, category } = JSON.parse(requestBody);
                const recipes = await generateRecipes(ingredients || "", category || "anything");
                sendJson(response, 200, { recipes });
            } catch (error) {
                console.error("Unable to generate AI recipes", error);
                sendJson(response, 502, { error: error.message });
            }
        });
        return;
    }

    if (requestUrl.pathname !== "/api/cook-sessions") {
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
            const deviceId = request.headers["x-bbq-device-id"] || null;
            upsertMany(validSessions, deviceId);
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