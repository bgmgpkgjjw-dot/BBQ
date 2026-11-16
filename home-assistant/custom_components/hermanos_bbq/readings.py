"""Decode the thermometer's notification packets."""


def decode_packet(data: bytes | bytearray) -> dict[int, float | None]:
    """Return changed probe values in Celsius; missing slots are dropouts."""
    if len(data) < 14:
        raise ValueError(f"Thermometer packet is too short: {len(data)} bytes")

    readings: dict[int, float | None] = {}
    for index in range(6):
        offset = 2 + index * 2
        raw = (data[offset] << 8) | data[offset + 1]
        if raw == 0:
            continue
        readings[index] = None if raw == 0xFFFF else raw / 10
    return readings
