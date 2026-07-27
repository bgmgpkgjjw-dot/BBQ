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



/* ==========================================================
   SCALING
========================================================== */


function setServings(recipeId,value){

    const recipe = appState.recipes.find(
        r => r.id === recipeId
    );

    if(!recipe) return;


    const servings = Math.max(
        1,
        Number(value) || recipe.baseServings
    );


    appState.recipeScale =
        servings / recipe.baseServings;


    render();

}





function setPrimaryAmount(recipeId,value){

    const recipe = appState.recipes.find(
        r => r.id === recipeId
    );


    if(!recipe) return;


    const primary =
        recipe.ingredients.find(
            i => i.id === recipe.primaryIngredientId
        );


    if(!primary) return;


    const amount = Math.max(
        0.01,
        Number(value) || primary.amount
    );


    appState.recipeScale =
        amount / primary.amount;


    render();

}





function scaledIngredients(recipe){

    return recipe.ingredients.map(item => ({

        ...item,

        amount:
            roundAmount(
                item.amount * appState.recipeScale,
                item.unit
            )

    }));

}





function scaledServings(recipe){

    return Math.round(
        recipe.baseServings *
        appState.recipeScale
    );

}





function roundAmount(value,unit){

    if(unit === "g" || unit === "ml"){

        return Math.round(value);

    }


    if(unit === "kg"){

        return Math.round(value * 100) / 100;

    }


    return Math.round(value * 10) / 10;

}





function formatAmount(item){

    if(!item.unit){

        return `${item.amount}x`;

    }


    return `${item.amount} ${item.unit}`;

}



/* ==========================================================
   COOK CONTROL
========================================================== */


function loadRecipeIntoCook(recipeId){

    const recipe = appState.recipes.find(
        r => r.id === recipeId
    );

    if(!recipe){
        console.error("Recipe not found:", recipeId);
        return;
    }

    appState.cook.active = true;
    appState.cook.name = recipe.name;
    appState.cook.domeTarget = recipe.dome;
    appState.cook.meatTarget = recipe.target;
    appState.cook.duration = recipe.duration;

    appState.cook.phase = 0;
    appState.cook.phases = recipe.phases || [];
    appState.cook.completedPhases = [];

    appState.cook.servings = scaledServings(recipe);
    appState.cook.ingredients = scaledIngredients(recipe);

    appState.cook.startedAt = new Date().toISOString();
    appState.cook.lastPhaseChange = new Date().toISOString();

    appState.screen = "dashboard";

    startCookSession();

    render();

}





function startManualCook(){


    Object.assign(
        appState.cook,
        {

            active:true,

            name:"Handmatige cook",

            domeTarget:110,

            meatTarget:null,

            duration:"",

            phase:0,

            phases:[],

            servings:null,

            startedAt:
                new Date().toISOString()

        }

    );


    appState.screen="dashboard";


    render();


}




/* ==========================================================
   RECIPE LIST
========================================================== */


function recipeListView(){


    if(
        !appState.recipes ||
        appState.recipes.length === 0
    ){

        return `

        <div class="card">

            <p>
            Geen recepten beschikbaar.
            </p>

        </div>

        `;

    }



    return `


    <button
    class="button"
    onclick="startManualCook()">

    🔥 Start handmatige cook

    </button>


    <br><br>



    <div class="recipe-list">


    ${
        appState.recipes.map(recipe => `


        <div
        class="recipe"
        onclick="selectRecipe('${recipe.id}')">


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


        `).join("")
    }


    </div>


    `;


}



/* ==========================================================
   RECIPE DETAIL
========================================================== */


function recipeDetailView(){


    const recipe =
        appState.recipes.find(
            r => r.id === appState.selectedRecipe
        );



    if(!recipe){

        return `

        <div class="card">

        <p>
        Recept niet gevonden.
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


<button
class="button secondary"
onclick="backToRecipes()">

← Terug

</button>



<div class="card">

<h2>
${recipe.name}
</h2>

<p style="color:var(--muted)">
${recipe.category}
</p>

</div>




<div class="card">

<h3>Instellingen</h3>


<p>
Dome:
<strong>${recipe.dome}°C</strong>
</p>


${
recipe.target
?
`
<p>
Kern:
<strong>${recipe.target}°C</strong>
</p>
`
:""
}


<p>
Tijd:
<strong>${recipe.duration}</strong>
</p>


</div>





<div class="card">

<h3>Hoeveelheid</h3>


<div class="scale-row">

<label>
Porties
</label>


<input
type="number"
min="1"
value="${scaledServings(recipe)}"
onchange="setServings('${recipe.id}',this.value)"
>

</div>



${
primary
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
:""
}


</div>





<div class="card">

<h3>Ingrediënten</h3>


${
ingredients.map(item => `

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

${
recipe.setup.map(
step => `<li>${step}</li>`
).join("")
}

</ol>


</div>






<div class="card">

<h3>Fases</h3>


${
recipe.phases.map(
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

🔥 Start cook

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