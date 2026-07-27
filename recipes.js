/* ==========================================================
   Hermanos Grill Companion
   recipes.js

   Receptenoverzicht, receptdetail met schaalfunctie,
   en het laden van een recept in de actieve cook
   ========================================================== */


// ---------- Navigatie ----------

function selectRecipe(recipeId){

    appState.selectedRecipe = recipeId;

    appState.recipeScale = 1;

    appState.screen = "recipeDetail";

    render();

}


function backToRecipes(){

    appState.selectedRecipe = null;

    appState.screen = "recipes";

    render();

}


// ---------- Schaalfunctie ----------

// Herbereken de schaalfactor op basis van een nieuw aantal porties
function setServings(recipeId, value){

    const recipe = appState.recipes.find(r => r.id === recipeId);

    if(!recipe) return;

    const servings = Math.max(1, Number(value) || recipe.baseServings);

    appState.recipeScale = servings / recipe.baseServings;

    render();

}


// Herbereken de schaalfactor op basis van een nieuwe hoeveelheid
// van het hoofdingrediënt (bv. 3kg schouder -> 2.5kg)
function setPrimaryAmount(recipeId, value){

    const recipe = appState.recipes.find(r => r.id === recipeId);

    if(!recipe) return;

    const primary = recipe.ingredients.find(i => i.id === recipe.primaryIngredientId);

    if(!primary) return;

    const amount = Math.max(0.01, Number(value) || primary.amount);

    appState.recipeScale = amount / primary.amount;

    render();

}


// Geeft de ingrediëntenlijst terug, geschaald met de huidige factor
function scaledIngredients(recipe){

    return recipe.ingredients.map(ing => ({

        ...ing,

        amount: roundAmount(ing.amount * appState.recipeScale, ing.unit)

    }));

}


function scaledServings(recipe){

    return Math.round(recipe.baseServings * appState.recipeScale);

}


// Nette afronding: grammen/ml heel, kg/tbsp/tsp op 1 of 2 decimalen
function roundAmount(value, unit){

    if(unit === "g" || unit === "ml"){

        return Math.round(value);

    }

    if(unit === "kg"){

        return Math.round(value * 100) / 100;

    }

    return Math.round(value * 10) / 10;

}


function formatAmount(ing){

    if(!ing.unit){

        return `${ing.amount}x`;

    }

    return `${ing.amount} ${ing.unit}`;

}


// ---------- Cook laden ----------

function loadRecipeIntoCook(recipeId){

    const recipe = appState.recipes.find(r => r.id === recipeId);

    if(!recipe) return;

    const scale = appState.recipeScale;

    appState.cook = {

        active: true,

        name: recipe.name,

        domeTarget: recipe.dome,

        meatTarget: recipe.target,

        duration: recipe.duration,

        phase: 0,

        phases: recipe.phases,

        servings: scaledServings(recipe),

        ingredients: scaledIngredients(recipe)

    };

    appState.screen = "dashboard";

    render();

}


// ---------- Views ----------

function recipeListView(){

    return `

    <div class="recipe-list">

        ${

            appState.recipes.map(r => `

                <div class="recipe" onclick="selectRecipe('${r.id}')">

                    <h2>${r.name}</h2>

                    <p>${r.meat} · ${r.dome}°C · ${r.duration}</p>

                </div>

            `).join("")

        }

    </div>

    `;

}


function recipeDetailView(){

    const recipe = appState.recipes.find(r => r.id === appState.selectedRecipe);

    if(!recipe){

        return `<div class="card"><p>Recept niet gevonden.</p></div>`;

    }

    const ingredients = scaledIngredients(recipe);

    const primary = ingredients.find(i => i.id === recipe.primaryIngredientId);

    const servings = scaledServings(recipe);

    return `

    <button class="button secondary" style="margin-bottom:16px" onclick="backToRecipes()">
        ← Terug naar recepten
    </button>

    <div class="card">

        <h2>${recipe.name}</h2>

        <p style="color:var(--muted)">${recipe.meat} · ${recipe.category}</p>

    </div>

    <div class="card">

        <h3>Temperatuur &amp; tijd</h3>

        <p>Dome: <strong>${recipe.dome}°C</strong></p>

        ${recipe.target ? `<p>Kerntemperatuur: <strong>${recipe.target}°C</strong></p>` : ""}

        <p>Duur: <strong>${recipe.duration}</strong></p>

    </div>

    <div class="card">

        <h3>Hoeveelheid aanpassen</h3>

        <div class="scale-row">

            <label>Porties</label>

            <input
                type="number"
                min="1"
                value="${servings}"
                oninput="setServings('${recipe.id}', this.value)"
            >

        </div>

        ${ primary ? `

        <div class="scale-row">

            <label>${primary.name} (${primary.unit || "st"})</label>

            <input
                type="number"
                min="0.01"
                step="0.1"
                value="${primary.amount}"
                oninput="setPrimaryAmount('${recipe.id}', this.value)"
            >

        </div>

        ` : "" }

    </div>

    <div class="card">

        <h3>Ingrediënten</h3>

        ${

            ingredients.map(ing => `

                <div class="ingredient-row">

                    <span>${ing.name}</span>

                    <strong>${formatAmount(ing)}</strong>

                </div>

            `).join("")

        }

    </div>

    <div class="card">

        <h3>Kamado setup</h3>

        <ol class="setup-list">

            ${ recipe.setup.map(step => `<li>${step}</li>`).join("") }

        </ol>

    </div>

    <div class="card">

        <h3>Fases</h3>

        ${

            recipe.phases.map(p => `

                <div class="ingredient-row">

                    <span>${p[0]}</span>

                    <strong>${p[1]}</strong>

                </div>

            `).join("")

        }

    </div>

    <button class="button" onclick="loadRecipeIntoCook('${recipe.id}')">

        🔥 Laad in actieve cook

    </button>

    `;

}
