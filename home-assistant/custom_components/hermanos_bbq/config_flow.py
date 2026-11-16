"""Configuration flow for the Hermanos BBQ thermometer."""

import re
from typing import Any

import probatio
from homeassistant import config_entries
from homeassistant.const import CONF_ADDRESS

from .const import DOMAIN

MAC_ADDRESS = re.compile(r"^(?:[0-9A-F]{2}:){5}[0-9A-F]{2}$")


class HermanosBBQConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Set up a thermometer by its Bluetooth address."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            address = user_input[CONF_ADDRESS].strip().upper()
            if not MAC_ADDRESS.fullmatch(address):
                errors["address"] = "invalid_address"
            else:
                await self.async_set_unique_id(address)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=f"Hermanos BBQ {address}", data={CONF_ADDRESS: address}
                )

        return self.async_show_form(
            step_id="user",
            data_schema=probatio.Schema({probatio.Required(CONF_ADDRESS): str}),
            errors=errors,
        )
