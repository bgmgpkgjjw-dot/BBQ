const { WebSocketServer } = require("ws");
const WebSocket = require("ws");

const port = Number(process.env.BBQ_GRILL_PORT || 8080);
const apiToken = process.env.BBQ_API_TOKEN || null;

const wss = new WebSocketServer({ port });
let latestData = {
    dome: 250,
    probe1: 250,
    probe2: 250,
};

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
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(latestData));
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
