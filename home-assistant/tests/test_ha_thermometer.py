"""Tests for the Home Assistant thermometer protocol and connection lifecycle."""

import asyncio
import importlib.util
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1] / "custom_components" / "hermanos_bbq"
PACKAGE = "_bbq_integration_test"


def load_module(name):
    spec = importlib.util.spec_from_file_location(f"{PACKAGE}.{name}", ROOT / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def packet(*values):
    return b"\x00\x00" + b"".join(value.to_bytes(2, "big") for value in values)


def setUpModule():
    package = types.ModuleType(PACKAGE)
    package.__path__ = [str(ROOT)]
    sys.modules[PACKAGE] = package
    global readings, coordinator
    load_module("const")
    readings = load_module("readings")

    bleak = types.ModuleType("bleak")
    bleak.BleakClient = object
    bleak_exc = types.ModuleType("bleak.exc")
    bleak_exc.BleakError = type("BleakError", (Exception,), {})
    homeassistant = types.ModuleType("homeassistant")
    components = types.ModuleType("homeassistant.components")
    components.bluetooth = types.SimpleNamespace(async_ble_device_from_address=lambda *a, **k: None)
    core = types.ModuleType("homeassistant.core")
    core.HomeAssistant = object
    core.callback = lambda function: function
    config_entries = types.ModuleType("homeassistant.config_entries")
    config_entries.ConfigEntry = object
    helpers = types.ModuleType("homeassistant.helpers")
    dispatcher = types.ModuleType("homeassistant.helpers.dispatcher")
    dispatcher.async_dispatcher_send = lambda *args: None
    with patch.dict(sys.modules, {
        "bleak": bleak,
        "bleak.exc": bleak_exc,
        "homeassistant": homeassistant,
        "homeassistant.components": components,
        "homeassistant.config_entries": config_entries,
        "homeassistant.core": core,
        "homeassistant.helpers": helpers,
        "homeassistant.helpers.dispatcher": dispatcher,
    }):
        coordinator = load_module("coordinator")


def tearDownModule():
    for name in list(sys.modules):
        if name == PACKAGE or name.startswith(f"{PACKAGE}."):
            del sys.modules[name]


class PacketTests(unittest.TestCase):
    def test_six_slots_and_special_values(self):
        result = readings.decode_packet(packet(1100, 675, 0, 0xFFFF, 1, 1234))
        self.assertEqual(result, {0: 110.0, 1: 67.5, 3: None, 4: 0.1, 5: 123.4})

    def test_short_packet_is_rejected(self):
        with self.assertRaises(ValueError):
            readings.decode_packet(b"\x00" * 13)


class ConnectionTests(unittest.IsolatedAsyncioTestCase):
    async def test_stale_data_is_cleared_and_unload_disconnects(self):
        sent = []
        ready = asyncio.Event()
        closed = asyncio.Event()

        class FakeEntry:
            def async_create_background_task(self, hass, coroutine, name):
                return asyncio.create_task(coroutine)

        class FakeClient:
            def __init__(self, device, disconnected_callback, timeout):
                self.is_connected = True

            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                closed.set()

            async def start_notify(self, uuid, notification):
                self.notify = notification
                notification(None, packet(1100, 675, 0, 0, 0, 0))
                ready.set()

        hass = object()
        thermometer = coordinator.Thermometer(hass, "AA:BB:CC:DD:EE:FF", "signal")
        with (
            patch.object(coordinator, "BleakClient", FakeClient),
            patch.object(coordinator, "STALE_SECONDS", 0.01),
            patch.object(coordinator.bluetooth, "async_ble_device_from_address", return_value=object()),
            patch.object(coordinator, "async_dispatcher_send", side_effect=lambda *args: sent.append(list(thermometer.values))),
        ):
            thermometer.start(FakeEntry())
            await asyncio.wait_for(ready.wait(), 1)
            self.assertEqual(thermometer.values[:2], [110.0, 67.5])
            await asyncio.sleep(1.05)
            self.assertEqual(thermometer.values, [None] * 6)
            thermometer._notification(None, packet(0, 680, 0, 0, 0, 0))
            self.assertEqual(thermometer.values[:2], [None, 68.0])
            await thermometer.stop()
            self.assertTrue(closed.is_set())
            self.assertEqual(thermometer.values, [None] * 6)
            self.assertGreaterEqual(len(sent), 4)

    async def test_dropout_keeps_value_disconnect_clears_and_short_packet_ignored(self):
        thermometer = coordinator.Thermometer(object(), "AA:BB:CC:DD:EE:FF", "signal")
        with patch.object(coordinator, "async_dispatcher_send"):
            thermometer._notification(None, packet(1100, 675, 0, 0, 0, 0))
            thermometer._notification(None, packet(0, 0xFFFF, 0, 0, 0, 0))
            self.assertEqual(thermometer.values[:2], [110.0, None])
            thermometer._notification(None, b"\x00")
            self.assertEqual(thermometer.values[:2], [110.0, None])
            thermometer._clear()
            self.assertEqual(thermometer.values, [None] * 6)


if __name__ == "__main__":
    unittest.main()
