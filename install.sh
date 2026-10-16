#!/usr/bin/env bash
# Installs the BBQ services on a Raspberry Pi (Debian/Raspberry Pi OS).
# Run from the repo checkout:  sudo ./install.sh
# Optional env: BBQ_USER (service user), BBQ_DATA_DIR, BBQ_TLS_CERT, BBQ_TLS_KEY,
#               OPENROUTER_API_KEY
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
    echo "Please run as root: sudo ./install.sh" >&2
    exit 1
fi

INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_USER="${BBQ_USER:-${SUDO_USER:-}}"
if [[ -z "$SERVICE_USER" || "$SERVICE_USER" == "root" ]]; then
    echo "Set BBQ_USER to a non-root user to run the services as." >&2
    exit 1
fi
USER_HOME="$(getent passwd "$SERVICE_USER" | cut -d: -f6)"
DATA_DIR="${BBQ_DATA_DIR:-$USER_HOME/bbq-data}"
ENV_DIR=/etc/bbq
ENV_FILE="$ENV_DIR/bbq.env"

echo "==> Installing system packages"
apt-get update
apt-get install -y nodejs npm python3 python3-venv bluez build-essential python3-dev qrencode

echo "==> Installing Node dependencies"
sudo -u "$SERVICE_USER" bash -c "cd '$INSTALL_DIR' && npm install --omit=dev"
sudo -u "$SERVICE_USER" bash -c "cd '$INSTALL_DIR/pi-services/grill-server' && npm install --omit=dev"

echo "==> Setting up Bluetooth gateway"
GATEWAY_DIR="$INSTALL_DIR/pi-services/btgateway"
sudo -u "$SERVICE_USER" bash -c "python3 -m venv '$GATEWAY_DIR/venv' && '$GATEWAY_DIR/venv/bin/pip' install --quiet websockets bleak"

echo "==> Writing $ENV_FILE"
mkdir -p "$ENV_DIR" "$DATA_DIR"
chown "$SERVICE_USER" "$DATA_DIR"
if [[ -f "$ENV_FILE" ]]; then
    echo "    Existing config kept (token unchanged)."
else
    umask 077
    {
        echo "BBQ_API_TOKEN=$(head -c 24 /dev/urandom | base64 | tr -d '/+=\n')"
        [[ -n "${BBQ_TLS_CERT:-}" ]] && echo "BBQ_TLS_CERT=$BBQ_TLS_CERT"
        [[ -n "${BBQ_TLS_KEY:-}" ]] && echo "BBQ_TLS_KEY=$BBQ_TLS_KEY"
        [[ -n "${OPENROUTER_API_KEY:-}" ]] && echo "OPENROUTER_API_KEY=$OPENROUTER_API_KEY"
    } > "$ENV_FILE"
    umask 022
fi

echo "==> Installing systemd units"
for unit in bbq-storage bbq-web grill-server btgateway; do
    sed -e "s|@USER@|$SERVICE_USER|g" \
        -e "s|@INSTALL_DIR@|$INSTALL_DIR|g" \
        -e "s|@DATA_DIR@|$DATA_DIR|g" \
        "$INSTALL_DIR/systemd/$unit.service" > "/etc/systemd/system/$unit.service"
done
systemctl daemon-reload
systemctl enable --now btgateway grill-server bbq-storage bbq-web

TOKEN="$(grep '^BBQ_API_TOKEN=' "$ENV_FILE" | cut -d= -f2-)"
SCHEME=http
grep -q '^BBQ_TLS_CERT=' "$ENV_FILE" && SCHEME=https
echo
PAIR_HOST="$(hostname).local"
PAIR_URL="$SCHEME://$PAIR_HOST:3000/#pair=$PAIR_HOST%7C$TOKEN"
echo "Done. Open the app at: $SCHEME://$PAIR_HOST:3000"
echo
echo "To pair a phone, open this link (or scan the QR code below) on it:"
echo "    $PAIR_URL"
if command -v qrencode >/dev/null 2>&1; then
    qrencode -t ANSIUTF8 "$PAIR_URL"
fi
echo
echo "Or enter manually in Settings > Network: address '$PAIR_HOST', token:"
echo "    $TOKEN"
echo "Anyone with this link or token can read your grill data; don't share it."
if [[ "$SCHEME" == http ]]; then
    echo "Note: iOS needs HTTPS for notifications; add BBQ_TLS_CERT and BBQ_TLS_KEY to $ENV_FILE, then: sudo systemctl restart bbq-web grill-server bbq-storage"
fi
