# Hermanos BBQ

A grill-monitoring PWA with a Raspberry Pi backend (Bluetooth gateway, live relay, cook history storage, optional AI recipe help).

## Quick start (Raspberry Pi)

1. Clone this repo onto the Pi, e.g. `git clone <repo-url> ~/BBQ`.
2. Run the installer:
   ```
   cd ~/BBQ
   sudo ./install.sh
   ```
   It installs dependencies, creates a random API token in `/etc/bbq/bbq.env`, and enables the four services (`btgateway`, `grill-server`, `bbq-storage`, `bbq-web`).
3. The installer prints a pairing link and QR code. Scan it with your phone (or open the link) and confirm; the app saves the server address and token for you. You can also enter them manually in the network settings.

The pairing link contains your API token, so treat it like a password. To pair another device later, rerun `sudo ./install.sh` (it keeps your existing token and reprints the link).

Optional installer env vars: `BBQ_USER`, `BBQ_DATA_DIR` (default `~/bbq-data`), `BBQ_TLS_CERT`, `BBQ_TLS_KEY`, `OPENROUTER_API_KEY`.

## Try it without hardware

On first launch the welcome screen offers a **demo** with a simulated cook. It can be toggled later in Settings > Demo mode, and the welcome screen can be reopened from there.

## HTTPS

iOS requires HTTPS for service workers and notifications. Add `BBQ_TLS_CERT` and `BBQ_TLS_KEY` (paths) to `/etc/bbq/bbq.env` and restart the services:

```
sudo systemctl restart bbq-web grill-server bbq-storage
```

## AI features

Set your own `OPENROUTER_API_KEY` in `/etc/bbq/bbq.env` to enable AI recipe suggestions.

## Bluetooth thermometer

The Pi gateway auto-detects a thermometer advertising the `ffb0` service (or named `Grill…`). To pin a specific unit, add `BBQ_BLE_ADDRESS=AA:BB:CC:DD:EE:FF` to `/etc/bbq/bbq.env` and run `sudo systemctl restart btgateway`. The thermometer accepts one connection at a time, so close other apps first.

Direct phone Bluetooth needs a Web Bluetooth browser (Chrome on Android, Bluefy on iOS) and lists all nearby devices.

## Ports

| Service | Port |
|---|---|
| bbq-web (app) | 3000 |
| grill-server (live data) | 8080 |
| bbq-storage (history) | 8090 |
| btgateway (localhost only) | 8765 |
