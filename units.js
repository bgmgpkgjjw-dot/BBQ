/* ==========================================================
   Hermanos Grill Companion
   units.js — °C / °F display helpers

   Everything is stored and calculated in °C. Only what is shown
   to the user, and what the user types in, is converted.
   ========================================================== */

function getTemperatureUnit() {
    return typeof appState !== "undefined" && appState?.settings?.temperatureUnit === "F" ? "F" : "C";
}

function temperatureUnitLabel() {
    return `°${getTemperatureUnit()}`;
}

function celsiusToDisplay(celsius) {
    const value = Number(celsius);
    if (celsius === null || celsius === undefined || !Number.isFinite(value)) return null;
    return getTemperatureUnit() === "F" ? value * 9 / 5 + 32 : value;
}

function displayToCelsius(displayValue) {
    const value = Number(displayValue);
    if (displayValue === "" || displayValue === null || !Number.isFinite(value)) return null;
    return getTemperatureUnit() === "F" ? (value - 32) * 5 / 9 : value;
}

// A difference (swing, carryover) scales without the +32 offset.
function celsiusDeltaToDisplay(delta) {
    const value = Number(delta);
    if (delta === null || delta === undefined || !Number.isFinite(value)) return null;
    return getTemperatureUnit() === "F" ? value * 9 / 5 : value;
}

function formatTemp(celsius, digits = 0) {
    const value = celsiusToDisplay(celsius);
    return value === null ? "—" : `${value.toFixed(digits)}${temperatureUnitLabel()}`;
}

function formatTempDelta(delta, digits = 0) {
    const value = celsiusDeltaToDisplay(delta);
    return value === null ? "—" : `${value.toFixed(digits)}°`;
}

// Whole degrees for targets typed into an input.
function targetInputValue(celsius) {
    const value = celsiusToDisplay(celsius);
    return value === null ? "" : String(Math.round(value));
}

// Recipe and AI text is written in °C; rewrite the temperatures in it for display.
function localizeTemperatureText(text) {
    if (getTemperatureUnit() !== "F" || typeof text !== "string") return text;
    const toF = value => Math.round(Number(value) * 9 / 5 + 32);
    return text
        .replace(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*°\s*C\b/g,
            (_, low, high) => `${toF(low)}-${toF(high)}°F`)
        .replace(/(\d+(?:\.\d+)?)\s*°\s*C\b/g, (_, value) => `${toF(value)}°F`);
}

function setTemperatureUnit(unit) {
    appState.settings.temperatureUnit = unit === "F" ? "F" : "C";
    if (typeof saveAppState === "function") saveAppState();
    if (typeof render === "function") render();
}

if (typeof window !== "undefined") {
    window.setTemperatureUnit = setTemperatureUnit;
}
