const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadAiClient() {
    const started = [];
    const context = vm.createContext({
        console,
        window: {},
        appState: {
            settings: { temperatureUnit: "C" },
            screen: "ai",
            ai: { savedRecipes: [], results: [], ideas: [] },
            cook: { phases: [], completedPhases: [] }
        },
        render() {},
        saveAppState() {},
        startCookSession: () => started.push(true),
        normalizeRecipePhases: recipe => recipe.phases,
        applyCurrentPhaseTargets() {}
    });
    for (const file of ["units.js", "ai.js"]) {
        vm.runInContext(fs.readFileSync(require.resolve(`./${file}`), "utf8"), context);
    }
    return { context, started };
}

test("starting an AI cook uses the recipe's own temperatures", () => {
    const { context, started } = loadAiClient();
    context.startAiCookWith({
        title: "Pulled pork", duration: "10 hours", dome_c: 135, core_c: 94,
        phases: [
            { name: "Smoke", dome_c: 120, core_c: null },
            { name: "Finish", dome_c: 135, core_c: 94 }
        ]
    });

    const cook = context.appState.cook;
    assert.equal(cook.domeTarget, 135);
    assert.equal(cook.meatTarget, 94);
    assert.equal(cook.phases[0].meatTarget, null);
    assert.equal(cook.phases[1].meatTarget, 94);
    assert.equal(started.length, 1);
});

test("recipes saved in the old string format still start correctly", () => {
    const { context } = loadAiClient();
    context.startAiCookWith({ title: "Old", dome_temperature: "180°C", target_temperature: "72°C", duration: "1h", phases: [] });
    assert.equal(context.appState.cook.domeTarget, 180);
    assert.equal(context.appState.cook.meatTarget, 72);
});

test("a recipe without a core target does not start a rest timer target", () => {
    const { context } = loadAiClient();
    context.startAiCookWith({ title: "Pizza", dome_c: 300, core_c: null, duration: "20m", phases: [] });
    assert.equal(context.appState.cook.meatTarget, null);
});

test("model text is escaped before it is shown", () => {
    const { context } = loadAiClient();
    const html = context.aiEscape('<img src=x onerror="alert(1)">');
    assert.equal(html.includes("<"), false);
});

test("saved recipe summaries follow the temperature unit", () => {
    const { context } = loadAiClient();
    const recipe = { dome_c: 120, core_c: 94, duration: "10 hours" };
    assert.equal(context.aiRecipeSummaryLine(recipe), "120°C dome · 94°C core · 10 hours");
    context.appState.settings.temperatureUnit = "F";
    assert.equal(context.aiRecipeSummaryLine(recipe), "248°F dome · 201°F core · 10 hours");
});
