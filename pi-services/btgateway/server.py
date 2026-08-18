import asyncio
import json
import websockets
from bleak import BleakClient

DEVICE_ADDRESS = "60:98:66:C3:BE:F3"
CHAR_UUID = "0000ffb2-0000-1000-8000-00805f9b34fb"

# Bound to localhost only: this feed carries no auth token, so it must
# never be reachable from the network, only from grill-server on this Pi.
BIND_HOST = "127.0.0.1"
BIND_PORT = 8765

clients = set()

async def websocket_handler(websocket):
    clients.add(websocket)
    print(f"Web client connected ({len(clients)} total)")

    try:
        await websocket.wait_closed()
    finally:
        clients.remove(websocket)
        print(f"Web client disconnected ({len(clients)} total)")

async def broadcast(data):
    if clients:
        await asyncio.gather(
            *(client.send(json.dumps(data)) for client in clients),
            return_exceptions=True
        )

def decode_ble_packet(data):
    """
    Decode BLE packet using same logic as bluetooth.js
    Probe slots at byte offsets: 2, 4, 6, 8, 10, 12
    """
    bytes_array = bytearray(data)

    if len(bytes_array) < 14:
        print(f"Packet too short: {len(bytes_array)} bytes")
        return None

    probes = {}
    probe_slots = [
        {"id": 1, "offset": 2},
        {"id": 2, "offset": 4},
        {"id": 3, "offset": 6},
        {"id": 4, "offset": 8},
        {"id": 5, "offset": 10},
        {"id": 6, "offset": 12}
    ]

    for slot in probe_slots:
        offset = slot["offset"]
        probe_id = slot["id"]

        high = bytes_array[offset]
        low = bytes_array[offset + 1]

        raw = (high << 8) | low

        # Skip invalid values
        if raw == 0xFFFF or raw == 0:
            continue

        temperature = raw / 10

        # Map probe ID to network format
        # Probe 1 → dome, Probe 2 → probe1, Probe 3 → probe2, etc.
        if probe_id == 1:
            probes["dome"] = raw
        elif probe_id == 2:
            probes["probe1"] = raw
        elif probe_id == 3:
            probes["probe2"] = raw
        elif probe_id == 4:
            probes["probe3"] = raw
        elif probe_id == 5:
            probes["probe4"] = raw
        elif probe_id == 6:
            probes["probe5"] = raw

        print(f"Probe {probe_id}: {temperature}°C (raw: {raw})")

    if probes:
        return probes

    return None

def notification_handler(sender, data):
    decoded = decode_ble_packet(data)

    if decoded:
        # For now, we'll add a placeholder
        packet = decoded.copy()

        print(f"Broadcasting: {packet}")

        asyncio.create_task(broadcast(packet))

async def bluetooth_task():
    while True:
        try:
            print("Connecting to BLE device...")

            async with BleakClient(DEVICE_ADDRESS) as client:
                print("BLE connected")

                await client.start_notify(
                    CHAR_UUID,
                    notification_handler
                )

                while client.is_connected:
                    await asyncio.sleep(1)

        except Exception as e:
            print("BLE error:", e)

        print("Retrying in 5 seconds...")
        await asyncio.sleep(5)

async def main():
    print(f"Starting WebSocket server on {BIND_HOST}:{BIND_PORT}")

    server = await websockets.serve(
        websocket_handler,
        BIND_HOST,
        BIND_PORT
    )

    asyncio.create_task(bluetooth_task())

    await server.wait_closed()

asyncio.run(main())
