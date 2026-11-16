"""Maintain the thermometer connection and publish its readings."""

import asyncio
import logging
import time

from bleak import BleakClient
from bleak.exc import BleakError
from homeassistant.components import bluetooth
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send

from .const import NOTIFY_UUID, RETRY_SECONDS, STALE_SECONDS
from .readings import decode_packet

_LOGGER = logging.getLogger(__name__)


class Thermometer:
    """A single persistent Bluetooth connection."""

    def __init__(self, hass: HomeAssistant, address: str, signal: str) -> None:
        self.hass = hass
        self.address = address
        self.signal = signal
        self.values: list[float | None] = [None] * 6
        self._last_reading = 0.0
        self._task: asyncio.Task | None = None

    def start(self, entry: ConfigEntry) -> None:
        self._task = entry.async_create_background_task(
            self.hass, self._run(), f"BBQ thermometer {self.address}"
        )

    async def stop(self) -> None:
        if self._task is not None:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None

    @callback
    def _clear(self) -> None:
        self._last_reading = 0.0
        if any(value is not None for value in self.values):
            self.values = [None] * 6
            async_dispatcher_send(self.hass, self.signal)

    @callback
    def _notification(self, _sender: object, data: bytearray) -> None:
        try:
            readings = decode_packet(data)
        except ValueError as error:
            _LOGGER.warning("Invalid thermometer notification: %s", error)
            return
        if not readings:
            return
        for index, value in readings.items():
            self.values[index] = value
        self._last_reading = time.monotonic()
        async_dispatcher_send(self.hass, self.signal)

    async def _run(self) -> None:
        while True:
            try:
                device = bluetooth.async_ble_device_from_address(
                    self.hass, self.address, connectable=True
                )
                if device is None:
                    _LOGGER.debug("Thermometer %s is not currently visible", self.address)
                else:
                    disconnected = asyncio.Event()
                    async with BleakClient(
                        device,
                        disconnected_callback=lambda _client: disconnected.set(),
                        timeout=20,
                    ) as client:
                        await client.start_notify(NOTIFY_UUID, self._notification)
                        _LOGGER.info("Connected to BBQ thermometer %s", self.address)
                        while not disconnected.is_set() and client.is_connected:
                            try:
                                await asyncio.wait_for(disconnected.wait(), timeout=1)
                            except TimeoutError:
                                if self._last_reading and (
                                    time.monotonic() - self._last_reading > STALE_SECONDS
                                ):
                                    self._clear()
            except (BleakError, OSError, TimeoutError) as error:
                _LOGGER.warning("BBQ thermometer %s connection failed: %s", self.address, error)
            finally:
                self._clear()
            await asyncio.sleep(RETRY_SECONDS)
