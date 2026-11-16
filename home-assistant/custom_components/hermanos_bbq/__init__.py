"""Home Assistant integration for Hermanos BBQ thermometers."""

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_ADDRESS, Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .coordinator import Thermometer

PLATFORMS = [Platform.SENSOR]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    thermometer = Thermometer(hass, entry.data[CONF_ADDRESS], f"{DOMAIN}_{entry.entry_id}")
    entry.runtime_data = thermometer
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    thermometer.start(entry)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_unload_platforms_or_raise(entry, PLATFORMS)
    await entry.runtime_data.stop()
