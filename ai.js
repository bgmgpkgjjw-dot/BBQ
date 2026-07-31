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
            You are a Kamado BBQ expert.

            Ingredients:
            ${appState.ai.ingredients}

            Category:
            ${appState.ai.category}

            Generate exactly 3 creative Kamado recipes.

            Return ONLY valid JSON.

            Format:

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

            No markdown.
            No explanations.
            JSON only.

        `;  

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {

                    "Authorization":
                        `Bearer $"sk - or - v1 - cccdd2fb87d96f1d1bb430bc11c1f0a691d24e519c011d3693697e65fb219cb5"`,

                    "Content-Type":
                        "application/json",

                    "HTTP-Referer":
                        window.location.origin,

                    "X-Title":
                        "Hermanos Grill Companion"
                },

                body: JSON.stringify({

                    model:
                        "openrouter/free",

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

        console.log("HTTP Status:", response.status);
        console.log("OpenRouter Response:", data);

        let text =
            data?.choices?.[0]
                ?.message?.content;

        if (!text) {

            console.error(
                "No content returned",
                data
            );

            throw new Error(
                JSON.stringify(data)
            );
        }

        text = text.replace(
            /```json|```/g,
            ""
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