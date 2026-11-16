# Hermanos BBQ for Home Assistant (early preview)

This is a separate Home Assistant custom integration. It does not depend on or
modify the existing PWA, and Home Assistant runs it inside its own container.
The current preview provides six native temperature sensors only. It does
**not** yet replace cook tracking, recipes, alerts, AI, or migrate existing
history and photos. Keep the existing app and back up its data.

## Installation

1. Make sure Home Assistant's [Bluetooth integration](https://www.home-assistant.io/integrations/bluetooth/)
   can see the Pi's adapter. Home Assistant Container needs host BlueZ and access
   to D-Bus; see that page for the container capabilities and mount.
2. Copy this project's `custom_components/hermanos_bbq` directory into
   `<home-assistant-config>/custom_components/hermanos_bbq` and restart Home Assistant.
3. Stop the old gateway with `sudo systemctl stop btgateway` on the Pi running
   it. The thermometer accepts only one Bluetooth connection at a time.
4. In **Settings > Devices & services > Add integration**, select **Hermanos BBQ**
   and enter the thermometer's Bluetooth MAC address. The old Pi's
   `/etc/bbq/bbq.env` may contain it as `BBQ_BLE_ADDRESS`; otherwise use the
   host Bluetooth tools to find it while the thermometer is powered on.
5. Add the new temperature entities to a dashboard. Disconnected probes are
   unavailable; all readings become unavailable if the thermometer sends no
   usable reading for 10 seconds. Home Assistant records subsequent sensor
   history according to its recorder settings.

To return to the existing gateway, remove or disable the Home Assistant
integration first, then run `sudo systemctl start btgateway`. This preview has
not yet been verified in Home Assistant or on physical hardware.

## Tests

From this directory, run `python -m unittest discover -s tests -v`. These tests
mock the Home Assistant and Bluetooth interfaces; they are not an end-to-end
Home Assistant or hardware test.
