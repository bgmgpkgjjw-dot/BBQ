/* ==========================================================
   Hermanos Grill Companion
   recipes.js

   Receptenoverzicht + detail + schaalfunctie
   ========================================================== */


/* ==========================================================
   NAVIGATIE
========================================================== */
/* ==========================================================
   RECIPE DATABASE
========================================================== */

appState.recipes = [

    {
        id:"pulled_pork",
        name:"Pulled Pork",
        category:"Varken",
        meat:"Varkensschouder",
        dome:110,
        target:92,
        duration:"10-12 uur",
        baseServings:8,
        primaryIngredientId:"i1",

        ingredients:[

            {
                id:"i1",
                name:"Varkensschouder",
                amount:3,
                unit:"kg"
            },

            {
                id:"i2",
                name:"Mosterd",
                amount:2,
                unit:"tbsp"
            },

            {
                id:"i3",
                name:"BBQ rub",
                amount:4,
                unit:"tbsp"
            }

        ],

        setup:[

            "Indirecte opstelling met deflectorplaten",
            "Stabiliseer dome op 110°C",
            "Voeg appelhout toe"

        ],

        phases:[

            [
                "Roken",
                "110°C tot kern 65°C"
            ],

            [
                "Wrap",
                "Tot kern 92°C"
            ],

            [
                "Rust",
                "30 minuten"

            ]

        ]

    },


    {
        id:"ribs",
        name:"Spare Ribs 3-2-1",
        category:"Varken",
        meat:"Spare ribs",
        dome:110,
        target:90,
        duration:"6 uur",
        baseServings:4,
        primaryIngredientId:"i1",

        ingredients:[

            {
                id:"i1",
                name:"Spare ribs",
                amount:2,
                unit:"kg"
            },

            {
                id:"i2",
                name:"BBQ rub",
                amount:3,
                unit:"tbsp"
            }

        ],

        setup:[

            "Indirect met deflectorplaten",
            "3 uur roken",
            "2 uur inpakken",
            "1 uur afwerken"

        ],

        phases:[

            [
                "Roken",
                "3 uur"
            ],

            [
                "Wrap",
                "2 uur"
            ],

            [
                "Afwerken",
                "1 uur"
            ]

        ]

    }

];
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
   SCHALEN
========================================================== */


function setServings(recipeId,value){

    const recipe = appState.recipes.find(
        r => r.id === recipeId
    );

    if(!recipe) return;


    const servings =
        Math.max(
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


    const ingredient =
        recipe.ingredients.find(
            i => i.id === recipe.primaryIngredientId
        );


    if(!ingredient) return;


    const amount =
        Math.max(
            0.01,
            Number(value) || ingredient.amount
        );


    appState.recipeScale =
        amount / ingredient.amount;


    render();

}




function scaledIngredients(recipe){

    return recipe.ingredients.map(i => ({

        ...i,

        amount:
            roundAmount(
                i.amount * appState.recipeScale,
                i.unit
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


    if(unit==="g" || unit==="ml"){

        return Math.round(value);

    }


    if(unit==="kg"){

        return Math.round(value*100)/100;

    }


    return Math.round(value*10)/10;

}




function formatAmount(item){


    if(!item.unit){

        return `${item.amount}x`;

    }


    return `${item.amount} ${item.unit}`;

}




/* ==========================================================
   COOK LADEN
========================================================== */


function loadRecipeIntoCook(recipeId){


    const recipe =
        appState.recipes.find(
            r=>r.id===recipeId
        );


    if(!recipe) return;



    appState.cook = {

        active:true,

        name:recipe.name,

        domeTarget:recipe.dome,

        meatTarget:recipe.target,

        duration:recipe.duration,

        phase:0,

        phases:recipe.phases,

        servings:
            scaledServings(recipe)

    };



    appState.screen="dashboard";


    render();


}



/* ==========================================================
   RECEPTEN LIJST
========================================================== */


function recipeListView(){


    if(!appState.recipes ||
       !appState.recipes.length){

        return `

        <div class="card">

            <p>
            Geen recepten beschikbaar.
            </p>

        </div>

        `;

    }



    return `


    <div class="recipe-list">


    ${

        appState.recipes.map(recipe=>`


        <div class="recipe"
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
   DETAIL
========================================================== */


function recipeDetailView(){


    const recipe =
        appState.recipes.find(
            r=>r.id===appState.selectedRecipe
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
            i=>i.id===recipe.primaryIngredientId
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


        <h3>
        Instellingen
        </h3>


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
        :
        ""
        }


        <p>
        Tijd:
        <strong>${recipe.duration}</strong>
        </p>


    </div>





    <div class="card">


    <h3>
    Hoeveelheid
    </h3>



    <div class="scale-row">


        <label>
        Porties
        </label>


        <input

        type="number"

        value="${scaledServings(recipe)}"

        min="1"

        onchange="
        setServings(
        '${recipe.id}',
        this.value
        )"

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

        onchange="
        setPrimaryAmount(
        '${recipe.id}',
        this.value
        )"

        >


    </div>

    `
    :
    ""
    }



    </div>







    <div class="card">


    <h3>
    Ingrediënten
    </h3>


    ${
    ingredients.map(i=>`

        <div class="ingredient-row">

            <span>
            ${i.name}
            </span>

            <strong>
            ${formatAmount(i)}
            </strong>

        </div>


    `).join("")
    }


    </div>








    <div class="card">


    <h3>
    Kamado setup
    </h3>


    <ol class="setup-list">


    ${
    recipe.setup
    .map(
    s=>`<li>${s}</li>`
    )
    .join("")
    }


    </ol>


    </div>







    <div class="card">


    <h3>
    Fases
    </h3>



    ${
    recipe.phases
    .map(
    p=>`

    <div class="ingredient-row">

        <span>
        ${p[0]}
        </span>


        <strong>
        ${p[1]}
        </strong>

    </div>

    `
    )
    .join("")
    }


    </div>







    <button

    class="button"

    onclick="
    loadRecipeIntoCook('${recipe.id}')
    ">

    🔥 Start cook

    </button>



    `;


}