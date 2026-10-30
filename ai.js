const AI_CATEGORIES = [

    "Anything",
    "Dessert",
    "Low & Slow",
    "Hot & Fast",
    "Beef",
    "Pork",
    "Chicken",
    "Fish",
    "Vegetarian",
    "Pizza"

];

const AI_TIME_OPTIONS = [
    { value: "", label: "Any time" },
    { value: "1", label: "Up to 1 h" },
    { value: "3", label: "Up to 3 h" },
    { value: "6", label: "Up to 6 h" },
    { value: "12", label: "Up to 12 h" }
];

const AI_REFINE_CHIPS = [
    "Faster",
    "Less effort",
    "No wrap",
    "Milder",
    "Spicier",
    "Fewer ingredients"
];

function aiEscape(value) {
    return typeof escapeHtmlText === "function"
        ? escapeHtmlText(value ?? "")
        : String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

// Recipes saved before the rewrite carry "180°C" strings; new ones carry numbers.
function aiRecipeDome(recipe) {
    const value = recipe?.dome_c ?? parseFloat(recipe?.dome_temperature ?? recipe?.temperature);
    return Number.isFinite(value) ? value : null;
}

function aiRecipeCore(recipe) {
    const value = recipe?.core_c ?? parseFloat(recipe?.target_temperature);
    return Number.isFinite(value) && value > 0 ? value : null;
}

function aiRecipePhases(recipe) {
    return (recipe?.phases || []).map(phase => {
        const dome = phase.dome_c ?? parseFloat(phase.dome_temperature);
        const core = phase.core_c ?? parseFloat(phase.target_temperature);
        return {
            name: phase.name,
            description: phase.description || "",
            domeTarget: Number.isFinite(dome) ? dome : null,
            meatTarget: Number.isFinite(core) && core > 0 ? core : null
        };
    });
}

function aiRecipeSummaryLine(recipe) {
    const dome = aiRecipeDome(recipe);
    const core = aiRecipeCore(recipe);
    return [
        dome != null ? `${formatTemp(dome)} dome` : "",
        core != null ? `${formatTemp(core)} core` : "",
        recipe?.duration && recipe.duration !== "—" ? recipe.duration : ""
    ].filter(Boolean).join(" · ");
}

async function requestAi(payload) {
    const cookStorageUrl = typeof getCookStorageUrl === "function" ? getCookStorageUrl() : null;
    if (!cookStorageUrl) {
        throw new Error("Configure the Pi's server address in Settings first.");
    }

    const response = await fetch(
        cookStorageUrl.replace("/api/cook-sessions", "/api/ai/recipes"),
        {
            method: "POST",
            headers: getCookStorageHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(payload)
        }
    );

    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.error || `The Pi answered with an error (${response.status}).`);
    }
    return data;
}

function aiContext() {
    return {
        ingredients: appState.ai.ingredients,
        category: appState.ai.category,
        servings: Number(appState.ai.servings) || 4,
        maxHours: Number(appState.ai.maxHours) || null
    };
}

// Runs one AI request with a loading flag and a visible, retryable error.
async function runAiTask(label, task) {
    if (appState.ai.loading) return;

    appState.ai.loading = label;
    appState.ai.error = null;
    render();

    try {
        await task();
    } catch (error) {
        console.error(error);
        appState.ai.error = error.message || "Something went wrong.";
    }

    appState.ai.loading = false;
    saveAppState();
    render();
}

function generateAiIdeas() {
    return runAiTask("Finding ideas…", async () => {
        appState.ai.lastAction = { mode: "ideas" };
        const data = await requestAi({ mode: "ideas", ...aiContext() });
        appState.ai.ideas = data.ideas;
        appState.ai.results = [];
    });
}

function generateAiRecipe(index) {
    const idea = appState.ai.ideas[index];
    if (!idea) return;

    return runAiTask(`Writing “${idea.title}”…`, async () => {
        appState.ai.lastAction = { mode: "recipe", index };
        const data = await requestAi({ mode: "recipe", ...aiContext(), idea });
        appState.ai.results = [data.recipe];
        appState.ai.selectedRecipe = data.recipe;
        appState.screen = "aiRecipe";
    });
}

function refineAiRecipe(instruction) {
    const text = String(instruction || "").trim();
    const recipe = appState.ai.selectedRecipe;
    if (!text || !recipe) return;

    return runAiTask("Updating recipe…", async () => {
        appState.ai.lastAction = { mode: "refine", instruction: text };
        const data = await requestAi({ mode: "refine", ...aiContext(), recipe, instruction: text });
        appState.ai.selectedRecipe = data.recipe;
        appState.ai.results = [data.recipe];
        appState.ai.refineText = "";
    });
}

function retryAiAction() {
    const action = appState.ai.lastAction;
    if (!action) return;
    if (action.mode === "ideas") return generateAiIdeas();
    if (action.mode === "recipe") return generateAiRecipe(action.index);
    return refineAiRecipe(action.instruction);
}

function renderAiError() {
    if (!appState.ai.error) return "";
    return `
        <div class="card ai-error">
            <p>${aiEscape(appState.ai.error)}</p>
            <button class="button" onclick="retryAiAction()">Try again</button>
        </div>`;
}

function aiAssistantView() {

    const ai = appState.ai;
    const busy = Boolean(ai.loading);

    return `

        <div class="card">

            <h2>
                AI Recipe Assistant
            </h2>

            <label>
                Ingredients
            </label>

            <input
                type="text"
                maxlength="300"
                value="${aiEscape(ai.ingredients)}"
                oninput="appState.ai.ingredients=this.value"
                placeholder="e.g. peaches, honey, mascarpone"
            >

            <div class="ai-action-row">

                <select
                    class="button ai-select"
                    onchange="appState.ai.category=this.value"
                >
                    ${AI_CATEGORIES.map(category => `
                        <option value="${category}" ${ai.category === category ? "selected" : ""}>
                            ${category}
                        </option>
                    `).join("")}
                </select>

                <select
                    class="button ai-select"
                    onchange="appState.ai.maxHours=this.value"
                >
                    ${AI_TIME_OPTIONS.map(option => `
                        <option value="${option.value}" ${String(ai.maxHours || "") === option.value ? "selected" : ""}>
                            ${option.label}
                        </option>
                    `).join("")}
                </select>

            </div>

            <div class="ai-action-row">

                <label class="ai-servings">
                    Servings
                    <input
                        type="number"
                        min="1"
                        max="20"
                        inputmode="numeric"
                        value="${Number(ai.servings) || 4}"
                        onchange="appState.ai.servings=this.value"
                    >
                </label>

                <button
                    class="button"
                    ${busy ? "disabled" : ""}
                    onclick="generateAiIdeas()"
                >
                    Get ideas
                </button>

            </div>

        </div>

        ${busy ? `<div class="card">${aiEscape(ai.loading)}</div>` : ""}

        ${renderAiError()}

        ${!busy && (ai.ideas || []).length ? `
            <h2 class="section-title">Ideas</h2>
            ${ai.ideas.map((idea, index) => `
                <div class="card ai-idea">
                    <h3>${aiEscape(idea.title)}</h3>
                    <p>${aiEscape(idea.summary)}</p>
                    <p class="ai-idea-meta">${aiEscape(idea.duration)}</p>
                    <button class="button" onclick="generateAiRecipe(${index})">Make this recipe</button>
                </div>
            `).join("")}
        ` : ""}
    `;
}

function openAiRecipe(index) {

    appState.ai.selectedRecipe =
        appState.ai.results[index];

    appState.screen = "aiRecipe";

    render();
}

function saveAiRecipe(index) {

    const recipe = index === "selected"
        ? appState.ai.selectedRecipe
        : appState.ai.results[index];

    if (!recipe) {
        return;
    }

    const exists = appState.ai.savedRecipes.some(saved =>
        saved.title === recipe.title && saved.description === recipe.description
    );
    if (!exists) {
        appState.ai.savedRecipes.push(structuredClone(recipe));
    }

    saveAppState();

    if (typeof showNotice === "function") {
        showNotice(exists ? "Already saved" : "Recipe saved", recipe.title);
    }

    render();
}

function aiRecipeDetailView() {

    const recipe =
        appState.ai.selectedRecipe;

    if (!recipe) {

        return `
            <div class="card">
                <h2>
                    Recipe Not Found
                </h2>
            </div>
        `;
    }

    const dome = aiRecipeDome(recipe);
    const core = aiRecipeCore(recipe);
    const busy = Boolean(appState.ai.loading);
    const isSaved = appState.ai.savedRecipes.some(saved =>
        saved === recipe || (saved.title === recipe.title && saved.description === recipe.description)
    );

    return `

        <div class="card">

            <div class="detail-actions-row">
                <button
                    class="button secondary"
                    onclick="appState.screen='ai'; render();"
                >
                    ← Back
                </button>

                <button
                    class="button"
                    onclick="startAiCookFromSelectedRecipe()"
                >
                    Start cook
                </button>

                ${isSaved ? `
                <button
                    class="button secondary"
                    onclick="deleteSelectedSavedAiRecipe()"
                >
                    Delete
                </button>` : `
                <button
                    class="button secondary"
                    onclick="saveAiRecipe('selected')"
                >
                    Save
                </button>`}
            </div>

            <h2>
                ${aiEscape(recipe.title)}
            </h2>

            <p>
                ${aiEscape(recipe.description)}
            </p>

            ${(recipe.notes || []).map(note => `<p class="ai-note">⚠ ${aiEscape(note)}</p>`).join("")}

        </div>

        <div class="cook-grid">

            <div>
                <span>Dome</span>
                <strong>${dome != null ? formatTemp(dome) : "--"}</strong>
            </div>

            <div>
                <span>Core</span>
                <strong>${core != null ? formatTemp(core) : "--"}</strong>
            </div>

            <div>
                <span>Duration</span>
                <strong>${aiEscape(recipe.duration || "--")}</strong>
            </div>

            <div>
                <span>Difficulty</span>
                <strong>${aiEscape(recipe.difficulty || "--")}</strong>
            </div>

        </div>

        ${(recipe.phases || []).length > 1 ? `
            <div class="card">
                <h3>Cook Phases</h3>
                ${aiRecipePhases(recipe).map(phase => `
                    <div class="ingredient-row">
                        <span>${aiEscape(phase.name)}</span>
                        <strong>
                            ${phase.domeTarget != null ? formatTemp(phase.domeTarget) : "--"}
                            ${phase.meatTarget != null ? ` · ${formatTemp(phase.meatTarget)}` : ""}
                        </strong>
                    </div>
                `).join("")}
            </div>
        ` : ""}

        <div class="card">

            <h3>
                Ingredients${recipe.servings ? ` · ${Number(recipe.servings)} servings` : ""}
            </h3>

            ${(recipe.ingredients || [])
            .map(ingredient => `<p>• ${aiEscape(ingredient)}</p>`)
            .join("")}

        </div>

        <div class="card">

            <h3>
                Steps
            </h3>

            <ol class="setup-list">
                ${(recipe.steps || [])
                .map(step => `<li>${aiEscape(typeof localizeTemperatureText === "function" ? localizeTemperatureText(step) : step)}</li>`)
                .join("")}
            </ol>

        </div>

        <div class="card">

            <h3>Change this recipe</h3>

            <div class="ai-chips">
                ${AI_REFINE_CHIPS.map(chip => `
                    <button class="chip" ${busy ? "disabled" : ""} onclick="refineAiRecipe('${chip}')">${chip}</button>
                `).join("")}
            </div>

            <div class="ai-action-row">
                <input
                    type="text"
                    maxlength="200"
                    value="${aiEscape(appState.ai.refineText || "")}"
                    oninput="appState.ai.refineText=this.value"
                    placeholder="e.g. swap the pork for chicken"
                >
                <button
                    class="button"
                    ${busy ? "disabled" : ""}
                    onclick="refineAiRecipe(appState.ai.refineText)"
                >
                    Update
                </button>
            </div>

            ${busy ? `<p>${aiEscape(appState.ai.loading)}</p>` : ""}
            ${renderAiError()}

        </div>

    `;
}

function deleteSelectedSavedAiRecipe() {
    const selected = appState.ai.selectedRecipe;

    if (!selected) return;

    const index = appState.ai.savedRecipes.findIndex(saved =>
        saved === selected ||
        (saved.title === selected.title && saved.description === selected.description)
    );

    if (index >= 0) {
        appState.ai.savedRecipes.splice(index, 1);
    }

    if (typeof saveAppState === "function") {
        saveAppState();
    }

    appState.ai.selectedRecipe = null;
    appState.screen = "ai";
    render();
}

function startAiCookWith(recipe) {

    if (!recipe) {
        return;
    }

    const dome = aiRecipeDome(recipe);
    const core = aiRecipeCore(recipe);
    const phases = aiRecipePhases(recipe);

    appState.cook.active = true;

    if (typeof syncWakeLockState === "function") {
        syncWakeLockState();
    }

    appState.cook.name = recipe.title;
    appState.cook.recipe = recipe.title;
    appState.cook.domeTarget = dome ?? 120;
    appState.cook.meatTarget = core;
    appState.cook.duration = recipe.duration;
    appState.cook.phase = 0;
    appState.cook.phases = normalizeRecipePhases({ dome, target: core, phases });
    appState.cook.completedPhases = [];
    appState.cook.startedAt = new Date().toISOString();

    applyCurrentPhaseTargets();

    startCookSession();

    saveAppState();

    appState.screen = "dashboard";

    render();
}

function startAiCookFromSelectedRecipe() {
    startAiCookWith(appState.ai.selectedRecipe);
}

function startAiCook(index) {
    startAiCookWith(appState.ai.results[index]);
}

function openSavedAiRecipe(index) {

    appState.ai.selectedRecipe =
        appState.ai.savedRecipes[index];

    appState.screen =
        "aiRecipe";

    render();
}

function deleteSavedAiRecipe(index) {

    appState.ai.savedRecipes.splice(
        index,
        1
    );

    if (
        typeof saveAppState === "function"
    ) {
        saveAppState();
    }

    appState.screen = "ai";
    render();
}

window.openSavedAiRecipe = openSavedAiRecipe;
window.startAiCook = startAiCook;
window.saveAiRecipe = saveAiRecipe;
window.openAiRecipe = openAiRecipe;
window.deleteSavedAiRecipe = deleteSavedAiRecipe;
window.generateAiIdeas = generateAiIdeas;
window.generateAiRecipe = generateAiRecipe;
window.refineAiRecipe = refineAiRecipe;
window.retryAiAction = retryAiAction;
