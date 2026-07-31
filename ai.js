const AI_CATEGORIES = [

    "anything",
    "dessert",
    "low-slow",
    "hot-fast",
    "weeknight",
    "beef",
    "pork",
    "chicken",
    "fish",
    "vegetarian",
    "pizza"

];

function generateMockRecipes() {

    appState.ai.loading = true;

    render();

    setTimeout(() => {

        appState.ai.results = [

            {
                title: "Grilled Peaches & Mascarpone",
                temperature: "180°C",
                duration: "20 min",
                difficulty: "Easy",

                ingredients: [
                    "Peaches",
                    "Mascarpone",
                    "Honey"
                ],

                steps: [
                    "Heat Kamado to 180°C",
                    "Halve peaches",
                    "Grill 10 minutes",
                    "Serve with mascarpone"
                ]
            },

            {
                title: "Smoked Peach Crumble",
                temperature: "160°C",
                duration: "45 min",
                difficulty: "Medium",

                ingredients: [
                    "Peaches",
                    "Honey",
                    "Butter"
                ],

                steps: [
                    "Prepare crumble",
                    "Add peaches",
                    "Smoke for 45 min"
                ]
            }

        ];

        appState.ai.loading = false;

        render();

    }, 1500);
}

function aiAssistantView() {

    return `

    <div class="card">

        <h2>
        🧠 AI Recipe Assistant
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
                        ${
                            appState.ai.category === category
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
            onclick="generateMockRecipes()"
        >
            Generate Recipes
        </button>

    </div>

    ${
        appState.ai.loading
        ?
        `
        <div class="card">
            Generating recipes...
        </div>
        `
        :
        appState.ai.results.map(
            renderAiRecipe
        ).join("")
    }
    `;
}

function renderAiRecipe(recipe){

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
            onclick="
                saveAiRecipe(
                    ${JSON.stringify(recipe)}
                )
            "
        >
            Save Recipe
        </button>

    </div>

    `;
}

function saveAiRecipe(recipe){

    appState.ai.savedRecipes.push(
        recipe
    );

    if(
        typeof saveAppState ===
        "function"
    ){
        saveAppState();
    }

    render();
}