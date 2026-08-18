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

async function generateOpenRouterRecipes() {

    appState.ai.loading = true;
    render();

    try {

        const cookStorageUrl = typeof getCookStorageUrl === "function" ? getCookStorageUrl() : null;
        if (!cookStorageUrl) {
            throw new Error("Configure the Pi's server address in Settings first.");
        }

        const response = await fetch(
            cookStorageUrl.replace("/api/cook-sessions", "/api/ai/recipes"),
            {
                method: "POST",
                headers: getCookStorageHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({
                    ingredients: appState.ai.ingredients,
                    category: appState.ai.category
                })
            }
        );

        const data = await response.json();

        console.log(
            "HTTP Status:",
            response.status
        );

        if (!response.ok) {
            throw new Error(
                data?.error || JSON.stringify(data)
            );
        }

        appState.ai.results = data.recipes;

    }
    catch (error) {

        console.error(error);

        appState.ai.results = [
            {
                title:
                    "Recipe generation failed",

                description:
                    error.message,

                temperature: "-",

                duration: "-",

                difficulty: "-",

                ingredients: [],

                steps: []
            }
        ];
    }

    appState.ai.loading = false;

    render();
}

function aiAssistantView() {

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
                value="${appState.ai.ingredients}"
                oninput="
                    appState.ai.ingredients=this.value
                "
                placeholder="
                    e.g. peaches, honey, mascarpone
                "
            >

            <div class="ai-action-row">

                <select
                    class="button ai-select"
                    onchange="
                        appState.ai.category=this.value
                    "
               >

                    ${AI_CATEGORIES.map(
        category => `
                            <option
                                value="${category}"
                                ${appState.ai.category === category
                ? "selected"
                : ""
            }
                            >
                                ${category}
                            </option>
                        `
    ).join("")}

                </select>

                <button
                    class="button"
                    onclick="generateOpenRouterRecipes()"
                >
                    Generate Recipes
                </button>

            </div>

        </div>
        

    ${appState.ai.loading
            ?
            `
        <div class="card">
            Generating recipes...
        </div>
        `
            :
            (appState.ai.results || []).map(
                (recipe, index) =>
                    renderAiRecipe(recipe, index)
            ).join("")
        }
    `;
}

function renderAiRecipe(recipe, index) {

    return `

        <div class="card">

            <h2>
                ${recipe.title}
            </h2>

            <p>
                ${recipe.dome_temperature ??
        recipe.temperature ??
        "--"
        }
                ·
                ${recipe.duration}
                ·
                ${recipe.difficulty}
            </p>

            <br>

            <h3>
                Ingredients
            </h3>

            ${(recipe.ingredients || [])
            .map(
                ingredient =>
                    `<p>• ${ingredient}</p>`
            )
            .join("")
        }

            <div class="recipe-actions">

                <button
                    class="button"
                    onclick="saveAiRecipe(${index})"
                >
                    Save
                </button>

                <button
                    class="button"
                    onclick="openAiRecipe(${index})"
                >
                    Open
                </button>

                <button
                    class="button"
                    onclick="startAiCook(${index})"
                >
                    Start
                </button>

            </div>

        </div>

    `;
}

function openAiRecipe(index) {

    appState.ai.selectedRecipe =
        appState.ai.results[index];

    appState.screen = "aiRecipe";

    render();
}

function saveAiRecipe(index) {

    console.log(
        "Saving recipe",
        index
    );

    const recipe =
        appState.ai.results[index];

    console.log(recipe);

    if (!recipe) {
        return;
    }

    appState.ai.savedRecipes.push(
        structuredClone(recipe)
    );

    console.log(
        appState.ai.savedRecipes
    );

    saveAppState();

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

    return `

        <div class="card">

            <div class="detail-actions-row">
                <button
                    class="button secondary"
                    onclick="
                        appState.screen='ai';
                        render();
                    "
                >
                    ← Back
                </button>

                <button
                    class="button"
                    onclick="startAiCookFromSelectedRecipe()"
                >
                    Start cook
                </button>

                <button
                    class="button secondary"
                    onclick="deleteSelectedSavedAiRecipe()"
                >
                    Delete
                </button>
            </div>

            <h2>
                ${recipe.title}
            </h2>

            <p>
                ${recipe.description}
            </p>

        </div>

        <div class="cook-grid">

            <div>

                <span>
                    Dome
                </span>

                <strong>
                    ${recipe.dome_temperature ??
                recipe.temperature ??
                "--"
                }
                </strong>

            </div>

            <div>

                <span>
                    Meat
                </span>

                <strong>
                    ${recipe.target_temperature ??
                "--"
                }
                </strong>

            </div>

            <div>

                <span>
                    Duration
                </span>

                <strong>
                    ${recipe.duration}
                </strong>

            </div>

            <div>

                <span>
                    Difficulty
                </span>

                <strong>
                    ${recipe.difficulty}
                </strong>

            </div>

</div>

        ${recipe.phases?.length

            ? `

                    <div class="card">

                        <h3>
                            Cook Phases
                        </h3>

                        ${recipe.phases.map(
                phase => `

                                <div class="ingredient-row">

                                    <span>
                                        ${phase.name}
                                    </span>

                                    <strong>
                                        ${phase.dome_temperature}°C
                                        ${phase.target_temperature
                                            ? ` · ${phase.target_temperature}°C`
                                            : ""
                                        }
                                    </strong>

                                </div>

                            `
            ).join("")}

                    </div>

                `

            : ""
        }

        <div class="card">

            <h3>
                Ingredients
            </h3>

            ${(recipe.ingredients || [])
            .map(
                ingredient =>
                    `<p>• ${ingredient}</p>`
            )
            .join("")
        }

        </div>

        <div class="card">

            <h3>
                Steps
            </h3>

            ${(recipe.steps || [])
            .map(
                step =>
                    `<p>${step}</p>`
            )
            .join("")
        }

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

function startAiCookFromSelectedRecipe() {

    const recipe =
        appState.ai.selectedRecipe;

    if (!recipe) {
        return;
    }

    const dome =
        parseInt(recipe.temperature);

    const target =
        parseInt(
            recipe.target_temperature
        );

    appState.cook.active = true;

    if (typeof syncWakeLockState === "function") {
        syncWakeLockState();
    }

    appState.cook.phases = normalizeRecipePhases({
        dome,
        target,
        phases: recipe.phases
    });

    appState.cook.name =
        recipe.title;

    appState.cook.domeTarget =
        dome;

    appState.cook.meatTarget =
        target;

    appState.cook.phase = 0;
    applyCurrentPhaseTargets();

    appState.cook.startedAt =
        new Date().toISOString();

    startCookSession();

    saveAppState();

    appState.screen = "dashboard";

    render();
}
``

// Start AI Cook Recipe

function startAiCook(index) {

    const recipe =
        appState.ai.results[index];

    if (!recipe) {
        return;
    }

    const domeTarget =
        parseInt(recipe.temperature);

    const meatTarget =
        parseInt(recipe.target_temperature);

    appState.cook.active = true;

    if (typeof syncWakeLockState === "function") {
        syncWakeLockState();
    }

    appState.cook.name =
        recipe.title;

    appState.cook.recipe =
        recipe.title;

    appState.cook.domeTarget =
        isNaN(domeTarget)
            ? 120
            : domeTarget;

    appState.cook.meatTarget =
        isNaN(meatTarget)
            ? null
            : meatTarget;

    appState.cook.duration =
        recipe.duration;

    appState.cook.phase = 0;

    appState.cook.phases = normalizeRecipePhases({
        dome: domeTarget,
        target: meatTarget,
        phases: recipe.phases
    });

    appState.cook.startedAt =
        new Date().toISOString();

    applyCurrentPhaseTargets();

    startCookSession();

    if (
        typeof saveAppState ===
        "function"
    ) {
        saveAppState();
    }

    appState.screen =
        "dashboard";

    render();
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

window.openSavedAiRecipe =
    openSavedAiRecipe;

window.startAiCook =
    startAiCook;

window.saveAiRecipe =
    saveAiRecipe;

window.openAiRecipe =
    openAiRecipe;

window.deleteSavedAiRecipe =
    deleteSavedAiRecipe;