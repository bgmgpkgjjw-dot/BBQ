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

async function generateGeminiRecipes() {

    appState.ai.loading = true;
    render();

    const prompt = `
You are a Kamado BBQ expert.

Ingredients:
${appState.ai.ingredients}

Category:
${appState.ai.category}

Generate 3 recipes.

Return JSON only.

Schema:

[
  {
    "title":"",
    "description":"",
    "temperature":"",
    "duration":"",
    "difficulty":"",
    "ingredients":[],
    "steps":[]
  }
]
`;

    try {

        const response =
            await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AQ.Ab8RN6JE8N8nI33k2m-B7yL83WVPgtPGXwMA6Bz8VPweXooWAA`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: prompt
                                    }
                                ]
                            }
                        ]
                    })
                }
            );

        const data =
            await response.json();

        const text =
            data.candidates?.[0]
                ?.content?.parts?.[0]
                ?.text;

        appState.ai.results =
            JSON.parse(
                text.replace(
                    /```json|```/g,
                    ""
                )
            );

    }
    catch (error) {

        console.error(error);

        appState.ai.results = [
            {
                title:
                    "Generation failed",
                description:
                    error.message
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
                onclick="generateGeminiRecipes()"        >
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
                renderAiRecipe
            ).join("")
        }
    `;
}

function renderAiRecipe(recipe) {

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

function saveAiRecipe(recipe) {

    appState.ai.savedRecipes.push(
        recipe
    );

    if (
        typeof saveAppState ===
        "function"
    ) {
        saveAppState();
    }

    render();
}