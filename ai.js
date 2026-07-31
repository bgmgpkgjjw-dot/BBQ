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

            - Always write in English.
            - Always use Celsius (°C).
            - Always use metric units (g, kg, ml).
            - Never use Fahrenheit.
            - Never use cups, ounces or pounds.
            - Return ONLY valid JSON.
            - Generate exactly 3 recipes.
            - Only use the best rated recipes, preferably from reknown bbq chefs.

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
        AI Recept Assistent
        </h2>

        <p>
        What ingredients do you have?
        </p>

        <input
            type="text"
            value="${appState.ai.ingredients}"
            oninput="
                appState.ai.ingredients=this.value
            "
            placeholder="
                peaches, honey, mascarpone
            "
        >

        <br><br>

        <select
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
        🌡 ${recipe.temperature}
        ·
        ⏱ ${recipe.duration}
        ·
        ⭐ ${recipe.difficulty}
        </p>

        <br>

        <h3>
        Ingredients
        </h3>

        ${recipe.ingredients.map(
        ingredient =>
            `<p>• ${ingredient}</p>`
    ).join("")}

        <br>

        <button
            class="button"
            onclick="saveAiRecipe(${index})"
        >
            💾 Save Recipe
        </button>

        <button
            class="button"
            onclick="openAiRecipe(${index})"
        >
        📖 View Recipe
        </button>

        <button
            class="button"
            onclick="startAiCook(${index})"
        >
            Start Cook
        </button>

    </div>

    `;
}

function saveAiRecipe(index){

    console.log(
        "Saving recipe",
        index
    );

    const recipe =
        appState.ai.results[index];

    console.log(recipe);

    if(!recipe){
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

window.startAiCook =
    startAiCook;

window.saveAiRecipe =
    saveAiRecipe;