"""Temperature sensors for the Hermanos BBQ thermometer."""

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTemperature
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import CONNECTION_BLUETOOTH
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, PROBE_NAMES
from .coordinator import Thermometer


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    thermometer: Thermometer = entry.runtime_data
    async_add_entities(
        BBQTemperatureSensor(thermometer, index, name)
        for index, name in enumerate(PROBE_NAMES)
    )


class BBQTemperatureSensor(SensorEntity):
    """A single thermometer probe."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS

    def __init__(self, thermometer: Thermometer, index: int, name: str) -> None:
        self._thermometer = thermometer
        self._index = index
        self._attr_name = name
        self._attr_unique_id = f"{thermometer.address}_{index + 1}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, thermometer.address)},
            connections={(CONNECTION_BLUETOOTH, thermometer.address)},
            name="Hermanos BBQ thermometer",
        )

    @property
    def native_value(self) -> float | None:
        return self._thermometer.values[self._index]

    @property
    def available(self) -> bool:
        return self.native_value is not None

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(self.hass, self._thermometer.signal, self._updated)
        )

    @callback
    def _updated(self) -> None:
        self.async_write_ha_state()
