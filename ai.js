const OPENROUTER_API_KEY =
    "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";

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

        const prompt = `

            You are a professional Kamado BBQ chef.

            IMPORTANT RULES:

            Generate 3 unique recipes based on the ingredients and recipe style provided.

            Recipe must popular online, used by professionals, stick to BBQ basics, like Smokey Goodness, Kamado Joe, Big Green Egg.

            For each recipe provide:

            title
            description
            temperature
            (required dome temperature in Celsius)
            target_temperature
            (required internal meat temperature in Celsius or null)
            duration
            difficulty
            ingredients
            steps

            IMPORTANT:
            temperature MUST contain the primary cooking temperature used in the recipe.

            If the recipe says:
            "Preheat to 130°C"

            then return:

            "temperature": "130°C"

            Do NOT leave temperature blank.

            Available ingredients:

            ${appState.ai.ingredients}

            Recipe style:

            ${appState.ai.category}

            Return JSON in this format:

            [
            {
            "title": "",
            "description": "",
            "dome_temperature": "180°C",
            "target_temperature": "72°C",
            "duration": "45 minutes",
            "difficulty": "Easy",
            "ingredients": [],
            "steps": []
            }
            ]


            `;

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${OPENROUTER_API_KEY}`,

                    "Content-Type":
                        "application/json",

                    "HTTP-Referer":
                        window.location.origin,

                    "X-Title":
                        "Hermanos Grill Companion"
                },

                body: JSON.stringify({

                    model: "openrouter/free",

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]

                })
            }
        );

        const data = await response.json();

        console.log(
            "HTTP Status:",
            response.status
        );

        console.log(
            "OpenRouter Response:",
            data
        );

        if (!response.ok) {
            throw new Error(
                JSON.stringify(data)
            );
        }

        let text =
            data?.choices?.[0]
                ?.message?.content;

        if (!text) {

            throw new Error(
                JSON.stringify(data)
            );
        }

        text = text.replace(
            /```json|```/g,
            ""
        );

        console.log(
            "AI TEXT:",
            text
        );

        appState.ai.results =
            JSON.parse(text);

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
                🧠 AI Recipe Assistant
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
            appState.ai.results.map(
                (recipe, index) =>
                    renderAiRecipe(recipe, index)
            )
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
                🌡 ${
                    recipe.dome_temperature ??
                    recipe.temperature ??
                    "--"
                }
                ·
                ⏱ ${recipe.duration}
                ·
                ⭐ ${recipe.difficulty}
            </p>

            <br>

            <h3>
                Ingredients
            </h3>

            ${
                (recipe.ingredients || [])
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
                    💾 Save
                </button>

                <button
                    class="button"
                    onclick="openAiRecipe(${index})"
                >
                    📖 Open
                </button>

                <button
                    class="button"
                    onclick="startAiCook(${index})"
                >
                    🔥 Start
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
                <h2>Recipe Not Found</h2>
            </div>
        `;
    }

    return `

        <div class="card">

            <button
                class="button"
                onclick="
                    appState.screen='ai';
                    render();
                "
            >
                ← Back
            </button>

            <h2>${recipe.title}</h2>

            <p>${recipe.description}</p>

            <br>

            <p>
                🔥 Dome Temperature:
                ${recipe.temperature}
            </p>

            <p>
                🥩 Target Temperature:
                ${recipe.target_temperature}
            </p>

            <p>
                ⏱ Duration:
                ${recipe.duration}
            </p>

            <p>
                ⭐ Difficulty:
                ${recipe.difficulty}
            </p>

        </div>

        <div class="card">

            <h3>Ingredients</h3>

            ${(recipe.ingredients || [])
            .map(
                ingredient =>
                    `<p>• ${ingredient}</p>`
            )
            .join("")
        }

        </div>

        <div class="card">

            <h3>Steps</h3>

            ${(recipe.steps || [])
            .map(
                step =>
                    `<p>${step}</p>`
            )
            .join("")
        }

        </div>

        <button
            class="button"
            onclick="startAiCookFromSelectedRecipe()"
        >
            🔥 Start Cook
        </button>

    `;
}
``

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

    appState.cook.name =
        recipe.title;

    appState.cook.domeTarget =
        dome;

    appState.cook.meatTarget =
        target;

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

    appState.cook.phases = [
        [
            "AI Recipe",
            recipe.description
        ]
    ];

    appState.cook.startedAt =
        new Date().toISOString();

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