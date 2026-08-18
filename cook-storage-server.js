const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.BBQ_STORAGE_PORT || 8090);
const dataDirectory = process.env.BBQ_DATA_DIR || "/home/william/bbq-data";
const dataFile = path.join(dataDirectory, "cook-sessions.json");

function readSessions() {
    try {
        const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
        return Array.isArray(data.sessions) ? data.sessions : [];
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Unable to read cook backup", error);
        }
        return [];
    }
}

function writeSessions(sessions) {
    fs.mkdirSync(dataDirectory, { recursive: true });
    const temporaryFile = `${dataFile}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify({ sessions }, null, 2));
    fs.renameSync(temporaryFile, dataFile);
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

            const sessions = new Map(readSessions().map(session => [session.id, session]));
            payload.sessions.forEach(session => {
                if (session && session.id) {
                    sessions.set(session.id, session);
                }
            });
            writeSessions(Array.from(sessions.values()));
            sendJson(response, 200, { sessions: Array.from(sessions.values()) });
        } catch (error) {
            console.error("Unable to save cook backup", error);
            sendJson(response, 400, { error: "Invalid cook backup" });
        }
    });
});

server.listen(port, "0.0.0.0", () => {
    console.log(`Cook storage listening on port ${port}; data directory: ${dataDirectory}`);
});