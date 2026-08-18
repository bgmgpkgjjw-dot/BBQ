/* ==========================================================
   Hermanos Grill Companion
   recipes.js

   Recipe overview + detail + scaling + cook loading

   Recipe data is loaded separately:
   recipes-data.js

========================================================== */


/* ==========================================================
   NAVIGATION
========================================================== */


function selectRecipe(recipeId) {

    appState.selectedRecipe = recipeId;

    appState.recipeScale = 1;

    appState.screen = "recipeDetail";

    render();

}



function backToRecipes() {

    appState.selectedRecipe = null;

    appState.screen = "recipes";

    render();

}



/* ==========================================================
   SCALING
========================================================== */


function setServings(recipeId, value) {

    const recipe = appState.recipes.find(
        r => r.id === recipeId
    );

    if (!recipe) return;


    const servings = Math.max(
        1,
        Number(value) || recipe.baseServings
    );


    appState.recipeScale =
        servings / recipe.baseServings;


    render();

}





function setPrimaryAmount(recipeId, value) {

    const recipe = appState.recipes.find(
        r => r.id === recipeId
    );


    if (!recipe) return;


    const primary =
        recipe.ingredients.find(
            i => i.id === recipe.primaryIngredientId
        );


    if (!primary) return;


    const amount = Math.max(
        0.01,
        Number(value) || primary.amount
    );


    appState.recipeScale =
        amount / primary.amount;


    render();

}





function scaledIngredients(recipe) {

    return recipe.ingredients.map(item => ({

        ...item,

        amount:
            roundAmount(
                item.amount * appState.recipeScale,
                item.unit
            )

    }));

}





function scaledServings(recipe) {

    return Math.round(
        recipe.baseServings *
        appState.recipeScale
    );

}





function roundAmount(value, unit) {

    if (unit === "g" || unit === "ml") {

        return Math.round(value);

    }


    if (unit === "kg") {

        return Math.round(value * 100) / 100;

    }


    return Math.round(value * 10) / 10;

}





function formatAmount(item) {

    if (!item.unit) {

        return `${item.amount}x`;

    }


    return `${item.amount} ${item.unit}`;

}

function phaseTemperature(value, pattern) {
    const match = String(value || "").match(pattern);
    return match ? Number(match[1]) : null;
}

function normalizeRecipePhases(recipe) {
    const phases = recipe?.phases || [];
    const defaultDome = Number(recipe?.dome);
    const defaultCore = Number(recipe?.target);

    return phases.map((phase, index) => {
        const isTuple = Array.isArray(phase);
        const description = isTuple ? phase[1] : phase.description;
        const name = isTuple ? phase[0] : phase.name;
        const domeTarget = isTuple
            ? phaseTemperature(description, /(\d+(?:\.\d+)?)\s*°?C/i)
            : Number(phase.domeTarget ?? phase.dome_temperature);
        const meatTarget = isTuple
            ? phaseTemperature(description, /(?:core|target|reach(?:es)?|until)[^\d]*(\d+(?:\.\d+)?)\s*°?C/i)
            : Number(phase.meatTarget ?? phase.target_temperature);

        return {
            name: name || `Phase ${index + 1}`,
            description: description || "",
            domeTarget: Number.isFinite(domeTarget)
                ? domeTarget
                : (Number.isFinite(defaultDome) ? defaultDome : null),
            meatTarget: Number.isFinite(meatTarget)
                ? meatTarget
                : null,
            completed: Boolean(phase.completed)
        };
    });
}

function applyCurrentPhaseTargets() {
    const phase = appState.cook.phases?.[appState.cook.phase];
    if (!phase) {
        return;
    }

    appState.cook.domeTarget = phase.domeTarget ?? null;
    appState.cook.meatTarget = phase.meatTarget ?? null;
}



/* ==========================================================
   COOK CONTROL
========================================================== */


function loadRecipeIntoCook(recipeId) {

    const recipe = appState.recipes.find(
        r => r.id === recipeId
    );

    if (!recipe) {
        console.error("Recipe not found:", recipeId);
        return;
    }

    appState.cook.active = true;

    if (typeof syncWakeLockState === "function") {
        syncWakeLockState();
    }

    appState.cook.name = recipe.name;
    appState.cook.recipe = recipe.name;
    appState.cook.domeTarget = recipe.dome;
    appState.cook.meatTarget = recipe.target;
    appState.cook.duration = recipe.duration;

    appState.cook.phase = 0;
    appState.cook.phases = normalizeRecipePhases(recipe);
    appState.cook.completedPhases = [];
    applyCurrentPhaseTargets();

    appState.cook.servings = scaledServings(recipe);
    appState.cook.ingredients = scaledIngredients(recipe);

    appState.cook.startedAt = new Date().toISOString();
    appState.cook.lastPhaseChange = new Date().toISOString();

    appState.screen = "dashboard";

    startCookSession();

    render();

}





/* ==========================================================
   RECIPE LIST
========================================================== */

function recipeListView() {


    if (
        !appState.recipes ||
        appState.recipes.length === 0
    ) {

        return `
            <div class="card">
                <p>
                    No recipes available.
                </p>
            </div>
        `;
    }

    return `

        <button
            class="button"
            onclick="
                appState.screen='ai';
                render();
            "
        >
            AI assistant
        </button>

        <br><br>

        <button
            class="button"
            onclick="startManualCook()"
        >
            Start cook
        </button>

        <br><br>

        <h2>Saved AI recipes</h2>

        ${appState.ai.savedRecipes.length

        ? `
            <div class="recipe-list saved-ai-list">
                ${appState.ai.savedRecipes.map(
                    (recipe, index) => `

                        <div
                            class="recipe saved-ai-recipe"
                            onclick="openSavedAiRecipe(${index})"
                        >

                            <h2>
                                ${recipe.title}
                            </h2>

                            <p>
                                ${recipe.dome_temperature ?? recipe.temperature ?? "--"}
                                ·
                                ${recipe.target_temperature ? `${recipe.target_temperature}°C target` : "No target"}
                                ·
                                ${recipe.duration || "--"}
                            </p>

                        </div>

                    `
                ).join("")}
            </div>
        `

    : `

        <div class="card">
            No saved AI recipes yet.
        </div>

    `
}

        <br>

    <h2>Recipe library</h2>

        <div class="recipe-list">

            ${appState.recipes.map(
            recipe => `

                        <div
                            class="recipe"
                            onclick="selectRecipe('${recipe.id}')"
                        >

                            <h2>
                                ${recipe.name}
                            </h2>

                            <p>
                                ${recipe.meat}
                                ·
                                ${recipe.dome}°C
                                ·
                                ${recipe.duration}
                            </p>

                        </div>

                    `
        ).join("")
        }

        </div>

    `;
}



/* ==========================================================
   RECIPE DETAIL
========================================================== */


function recipeDetailView() {


    const recipe =
        appState.recipes.find(
            r => r.id === appState.selectedRecipe
        );



    if (!recipe) {

        return `

        <div class="card">

        <p>
        Recipe not found.
        </p>

        </div>

        `;

    }



    const ingredients =
        scaledIngredients(recipe);



    const primary =
        ingredients.find(
            i => i.id === recipe.primaryIngredientId
        );



    return `


<div class="section-actions">
<button
class="button secondary"
onclick="backToRecipes()">

← Back

</button>
</div>



<div class="card">

<h2>
${recipe.name}
</h2>

<p style="color:var(--muted)">
${recipe.category}
</p>

</div>




<div class="card">

<h3>Settings</h3>


<p>
Dome:
<strong>${recipe.dome}°C</strong>
</p>


${recipe.target
            ?
            `
<p>
Kern:
<strong>${recipe.target}°C</strong>
</p>
`
            : ""
        }


<p>
Tijd:
<strong>${recipe.duration}</strong>
</p>


</div>





<div class="card">

<h3>Quantity</h3>


<div class="scale-row">

<label>
Servings
</label>


<input
type="number"
min="1"
value="${scaledServings(recipe)}"
onchange="setServings('${recipe.id}',this.value)"
>

</div>



${primary
            ?
            `

<div class="scale-row">

<label>
${primary.name}
</label>


<input
type="number"
step="0.1"
value="${primary.amount}"
onchange="setPrimaryAmount('${recipe.id}',this.value)"
>

</div>

`
            : ""
        }


</div>





<div class="card">

<h3>Ingredients</h3>


${ingredients.map(item => `

<div class="ingredient-row">

<span>
${item.name}
</span>


<strong>
${formatAmount(item)}
</strong>

</div>

`).join("")
        }


</div>






<div class="card">

<h3>Kamado setup</h3>


<ol class="setup-list">

${recipe.setup.map(
            step => `<li>${step}</li>`
        ).join("")
        }

</ol>


</div>






<div class="card">

<h3>Phases</h3>


${recipe.phases.map(
            phase => `

<div class="ingredient-row">

<span>
${phase[0]}
</span>


<strong>
${phase[1]}
</strong>

</div>

`
        ).join("")
        }


</div>





<button

class="button"

onclick="loadRecipeIntoCook('${recipe.id}')">

Start cook

</button>



`;

}





/* ==========================================================
   GLOBAL EXPORTS
========================================================== */

window.selectRecipe = selectRecipe;

window.backToRecipes = backToRecipes;

window.setServings = setServings;

window.setPrimaryAmount = setPrimaryAmount;

window.loadRecipeIntoCook = loadRecipeIntoCook;

window.startManualCook = startManualCook;