const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.BBQ_WEB_PORT || 3000);
const root = process.env.BBQ_WEB_ROOT || path.join(__dirname, "..", "..");

// iOS Safari requires HTTPS (secure context) for service workers, notifications
// and the Wake Lock API; falls back to plain HTTP if no cert is configured.
const tlsCertPath = process.env.BBQ_TLS_CERT || null;
const tlsKeyPath = process.env.BBQ_TLS_KEY || null;
const tlsOptions = tlsCertPath && tlsKeyPath
    ? { cert: fs.readFileSync(tlsCertPath), key: fs.readFileSync(tlsKeyPath) }
    : null;

const MIME_TYPES = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webmanifest": "application/manifest+json"
};

const server = (tlsOptions ? https : http).createServer(tlsOptions || {}, (request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405).end("Method not allowed");
        return;
    }

    const requestUrl = new URL(request.url, "http://localhost");

    // Serve the cert itself with the MIME type Safari/iOS needs to trigger its
    // "Install Profile" flow, so the cert can be trusted directly from a tapped link.
    if (requestUrl.pathname === "/bbq-cert.cer" && tlsCertPath) {
        fs.readFile(tlsCertPath, (error, data) => {
            if (error) {
                response.writeHead(404).end("Not found");
                return;
            }
            response.writeHead(200, { "Content-Type": "application/x-x509-ca-cert" });
            response.end(data);
        });
        return;
    }

    let relativePath = decodeURIComponent(requestUrl.pathname);
    if (relativePath === "/") {
        relativePath = "/index.html";
    }

    // Prevent path traversal outside the served root.
    const filePath = path.normalize(path.join(root, relativePath));
    if (!filePath.startsWith(path.normalize(root))) {
        response.writeHead(403).end("Forbidden");
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            response.writeHead(404).end("Not found");
            return;
        }

        const contentType = MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
        response.writeHead(200, { "Content-Type": contentType });
        response.end(request.method === "HEAD" ? undefined : data);
    });
});

server.listen(port, "0.0.0.0", () => {
    console.log(`Web server listening on ${tlsOptions ? "https" : "http"}://0.0.0.0:${port}; root: ${root}`);
});
