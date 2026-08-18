/* ==========================================================
   Hermanos Grill Companion
   recipes-data.js

   Curated Kamado BBQ recipe database
========================================================== */

const ingredient = (name, amount, unit) => ({ name, amount, unit });
const phase = (name, description, domeTarget = null, meatTarget = null) => ({
    name,
    description,
    domeTarget,
    meatTarget,
    completed: false
});
const bbqRecipe = recipe => ({
    ...recipe,
    primaryIngredientId: "i1",
    ingredients: recipe.ingredients.map((item, index) => ({
        id: `i${index + 1}`,
        ...item
    }))
});

appState.recipes = [
    bbqRecipe({
        id: "texas_brisket", name: "Central Texas Brisket", category: "Beef",
        meat: "Whole packer brisket", dome: 120, target: 94, duration: "10-14 hours", baseServings: 10,
        ingredients: [ingredient("Whole packer brisket", 5, "kg"), ingredient("Kosher salt", 3, "tbsp"), ingredient("16-mesh black pepper", 3, "tbsp"), ingredient("Beef tallow", 100, "g")],
        setup: ["Trim the fat cap to about 6 mm and square the edges", "Run the Kamado indirect with a heat deflector and drip pan", "Use post oak or oak chunks and stabilize at 120°C", "Place the brisket fat side toward the hotter side"],
        phases: [phase("Smoke", "Smoke until the bark is dark and the core reaches 70°C", 120, 70), phase("Wrap", "Wrap in butcher paper with a little tallow; finish until probe tender", 125, 94), phase("Rest", "Hold wrapped in a dry cooler or warm oven for at least 60 minutes")]
    }),
    bbqRecipe({
        id: "beef_plate_ribs", name: "Texas Beef Plate Ribs", category: "Beef",
        meat: "3-bone beef plate ribs", dome: 125, target: 96, duration: "7-9 hours", baseServings: 6,
        ingredients: [ingredient("Beef plate ribs", 2.5, "kg"), ingredient("Kosher salt", 2, "tbsp"), ingredient("Black pepper", 2, "tbsp"), ingredient("Beef stock", 250, "ml")],
        setup: ["Trim only loose fat and silver skin; leave the fat cap", "Set the Kamado indirect with a drip pan", "Use post oak and stabilize at 125°C", "Keep the thickest side toward the fire"],
        phases: [phase("Smoke", "Build bark until the core reaches 75°C", 125, 75), phase("Finish", "Wrap only if the bark is set; cook until probe tender", 130, 96), phase("Rest", "Rest wrapped for 45 minutes")]
    }),
    bbqRecipe({
        id: "chuck_roast", name: "Smoked Chuck Roast", category: "Beef",
        meat: "Boneless beef chuck roast", dome: 130, target: 94, duration: "6-8 hours", baseServings: 6,
        ingredients: [ingredient("Chuck roast", 2, "kg"), ingredient("Kosher salt", 1, "tbsp"), ingredient("Black pepper", 1, "tbsp"), ingredient("Beef tallow", 50, "g")],
        setup: ["Trim hard fat and season generously with salt and pepper", "Run indirect with a heat deflector and drip pan", "Use oak and stabilize the dome at 130°C", "Place the roast over the drip pan"],
        phases: [phase("Smoke", "Smoke until bark is set and core reaches 72°C", 130, 72), phase("Braise", "Cover with a little stock or tallow until fork tender", 140, 94), phase("Rest", "Rest covered for 30 minutes")]
    }),
    bbqRecipe({
        id: "beef_back_ribs", name: "Pepper-Crusted Beef Back Ribs", category: "Beef",
        meat: "Beef back ribs", dome: 130, target: 94, duration: "5-6 hours", baseServings: 4,
        ingredients: [ingredient("Beef back ribs", 2, "kg"), ingredient("Kosher salt", 2, "tbsp"), ingredient("Black pepper", 2, "tbsp"), ingredient("Beef stock", 150, "ml")],
        setup: ["Remove the membrane and trim loose edges", "Set up indirect with a drip pan", "Use oak or post oak at 130°C", "Keep the lid closed during the first three hours"],
        phases: [phase("Smoke", "Smoke until the bark is dark and the core reaches 75°C", 130, 75), phase("Finish", "Wrap if needed and cook until tender", 135, 94), phase("Rest", "Rest for 30 minutes")]
    }),
    bbqRecipe({
        id: "beef_cheeks", name: "Barbecue Beef Cheeks", category: "Beef",
        meat: "Beef cheeks", dome: 135, target: 94, duration: "6-8 hours", baseServings: 6,
        ingredients: [ingredient("Beef cheeks", 1.5, "kg"), ingredient("Kosher salt", 1, "tbsp"), ingredient("Black pepper", 1, "tbsp"), ingredient("Beef stock", 300, "ml")],
        setup: ["Trim the silver skin and season the cheeks", "Run the Kamado indirect with a drip pan", "Use oak at 135°C", "Prepare a covered Dutch oven for the second phase"],
        phases: [phase("Smoke", "Smoke until the bark is set and the core reaches 70°C", 135, 70), phase("Braise", "Cover with beef stock and cook until probe tender", 150, 94), phase("Rest", "Rest covered for 30 minutes")]
    }),
    bbqRecipe({
        id: "tri_tip", name: "Central Coast Tri-Tip", category: "Beef",
        meat: "Tri-tip", dome: 125, target: 54, duration: "1.5-2 hours", baseServings: 4,
        ingredients: [ingredient("Tri-tip", 1.2, "kg"), ingredient("Kosher salt", 1, "tbsp"), ingredient("Black pepper", 1, "tbsp"), ingredient("Garlic powder", 1, "tsp")],
        setup: ["Season at least one hour ahead", "Set the Kamado for indirect cooking at 125°C", "Prepare a direct sear zone for the final phase", "Slice across the grain after resting"],
        phases: [phase("Smoke", "Cook indirect until the core reaches 48°C", 125, 48), phase("Sear", "Open the vents and sear over direct heat to finish", 260, 54), phase("Rest", "Rest for 10 minutes")]
    }),
    bbqRecipe({
        id: "prime_rib", name: "Oak-Smoked Prime Rib", category: "Beef",
        meat: "Bone-in rib roast", dome: 135, target: 54, duration: "3-4 hours", baseServings: 6,
        ingredients: [ingredient("Bone-in rib roast", 2.5, "kg"), ingredient("Kosher salt", 2, "tbsp"), ingredient("Black pepper", 1, "tbsp"), ingredient("Fresh rosemary", 2, "tbsp")],
        setup: ["Dry-brine the roast overnight", "Run indirect at 135°C with a drip pan", "Use oak for a clean smoke profile", "Remove the deflector for the final sear"],
        phases: [phase("Smoke", "Smoke until the core reaches 48°C", 135, 48), phase("Sear", "Sear all sides over direct heat", 260, 54), phase("Rest", "Rest loosely covered for 20 minutes")]
    }),
    bbqRecipe({
        id: "picanha", name: "Picanha Reverse Sear", category: "Beef",
        meat: "Picanha roast", dome: 130, target: 54, duration: "2-3 hours", baseServings: 5,
        ingredients: [ingredient("Picanha", 1.2, "kg"), ingredient("Coarse salt", 1, "tbsp"), ingredient("Black pepper", 1, "tsp"), ingredient("Garlic powder", 1, "tsp")],
        setup: ["Score the fat cap without cutting into the meat", "Run indirect at 130°C", "Use a drip pan and a small oak chunk", "Finish with a very hot direct sear"],
        phases: [phase("Smoke", "Cook fat side up until the core reaches 46°C", 130, 46), phase("Sear", "Sear the fat cap and all sides over direct heat", 260, 54), phase("Rest", "Rest for 15 minutes")]
    }),
    bbqRecipe({
        id: "reverse_sear_ribeye", name: "Reverse-Sear Ribeye", category: "Beef",
        meat: "Thick ribeye steak", dome: 120, target: 54, duration: "60-90 minutes", baseServings: 2,
        ingredients: [ingredient("Thick ribeye steak", 800, "g"), ingredient("Kosher salt", 1, "tsp"), ingredient("Black pepper", 1, "tsp"), ingredient("Beef tallow", 1, "tbsp")],
        setup: ["Salt the steak one hour ahead", "Run indirect at 120°C", "Use a small oak chunk if desired", "Remove the deflector before searing"],
        phases: [phase("Smoke", "Bring the core gently to 46°C", 120, 46), phase("Sear", "Sear over direct heat until the core reaches 54°C", 260, 54), phase("Rest", "Rest for 8 minutes")]
    }),
    bbqRecipe({
        id: "smoked_steak", name: "Smoked Strip Steak", category: "Beef",
        meat: "New York strip steak", dome: 120, target: 54, duration: "45-60 minutes", baseServings: 2,
        ingredients: [ingredient("New York strip steaks", 600, "g"), ingredient("Kosher salt", 2, "tsp"), ingredient("Black pepper", 1, "tsp"), ingredient("Butter", 30, "g")],
        setup: ["Dry the steaks and season generously", "Set indirect at 120°C", "Use a direct sear zone for the finish", "Rest before slicing"],
        phases: [phase("Smoke", "Smoke until the core reaches 45°C", 120, 45), phase("Sear", "Sear quickly over direct heat to 54°C", 260, 54), phase("Rest", "Rest for 8 minutes")]
    }),
    bbqRecipe({
        id: "flank_steak", name: "Oak-Smoked Flank Steak", category: "Beef",
        meat: "Flank steak", dome: 135, target: 54, duration: "45-60 minutes", baseServings: 4,
        ingredients: [ingredient("Flank steak", 900, "g"), ingredient("Kosher salt", 2, "tsp"), ingredient("Black pepper", 2, "tsp"), ingredient("Garlic powder", 1, "tsp")],
        setup: ["Season the steak and rest at room temperature", "Run indirect with a small oak chunk", "Prepare a hot direct sear zone", "Slice thinly across the grain"],
        phases: [phase("Smoke", "Smoke until the core reaches 46°C", 135, 46), phase("Sear", "Sear both sides to a 54°C core", 260, 54), phase("Rest", "Rest for 10 minutes")]
    }),
    bbqRecipe({
        id: "skirt_steak", name: "Hot-and-Fast Skirt Steak", category: "Beef",
        meat: "Skirt steak", dome: 260, target: 54, duration: "20-30 minutes", baseServings: 4,
        ingredients: [ingredient("Skirt steak", 700, "g"), ingredient("Kosher salt", 2, "tsp"), ingredient("Black pepper", 2, "tsp"), ingredient("Lime", 1, null)],
        setup: ["Pat the steak dry and season just before cooking", "Run the Kamado direct and very hot", "Clean and oil the cooking grate", "Slice across the grain immediately after resting"],
        phases: [phase("Grill", "Grill over direct heat until the core reaches 54°C", 260, 54), phase("Rest", "Rest for 8 minutes")]
    }),
    bbqRecipe({
        id: "beef_burnt_ends", name: "Brisket Point Burnt Ends", category: "Beef",
        meat: "Cooked brisket point", dome: 135, target: 95, duration: "2-3 hours", baseServings: 6,
        ingredients: [ingredient("Cooked brisket point", 1.5, "kg"), ingredient("Beef tallow", 75, "g"), ingredient("BBQ sauce", 200, "ml"), ingredient("Brown sugar", 2, "tbsp")],
        setup: ["Cut the cooked brisket point into large cubes", "Set the Kamado indirect at 135°C", "Use a shallow pan to catch rendered fat", "Keep the cubes uncovered until bark is set"],
        phases: [phase("Bark", "Smoke the cubes until the edges are dark", 135, 85), phase("Glaze", "Cover with tallow and sauce until sticky and tender", 145, 95), phase("Rest", "Rest for 15 minutes")]
    }),
    bbqRecipe({
        id: "smoked_meatloaf", name: "Oak-Smoked Beef Meatloaf", category: "Beef",
        meat: "Beef meatloaf", dome: 150, target: 71, duration: "2-2.5 hours", baseServings: 6,
        ingredients: [ingredient("Ground beef", 1, "kg"), ingredient("Breadcrumbs", 100, "g"), ingredient("Eggs", 2, null), ingredient("BBQ sauce", 150, "ml")],
        setup: ["Shape the loaf loosely for better smoke penetration", "Run indirect at 150°C with a drip pan", "Use oak or pecan", "Brush with sauce near the end"],
        phases: [phase("Smoke", "Smoke until the core reaches 65°C", 150, 65), phase("Glaze", "Brush with sauce and finish to 71°C", 160, 71), phase("Rest", "Rest for 15 minutes")]
    }),
    bbqRecipe({
        id: "texas_burgers", name: "Texas-Style Smoked Burgers", category: "Beef",
        meat: "Beef burgers", dome: 180, target: 68, duration: "35-45 minutes", baseServings: 4,
        ingredients: [ingredient("80/20 ground beef", 800, "g"), ingredient("Kosher salt", 2, "tsp"), ingredient("Black pepper", 2, "tsp"), ingredient("Cheddar", 4, null)],
        setup: ["Form thick patties without compressing them", "Run the Kamado indirect at 180°C", "Add a small oak or hickory chunk", "Prepare a direct zone for the final sear"],
        phases: [phase("Smoke", "Smoke until the core reaches 60°C", 180, 60), phase("Sear", "Sear and melt the cheese to a 68°C core", 230, 68), phase("Rest", "Rest for 5 minutes")]
    }),
    bbqRecipe({
        id: "pulled_pork", name: "Central Texas Pulled Pork", category: "Pork",
        meat: "Bone-in pork shoulder", dome: 120, target: 94, duration: "9-12 hours", baseServings: 8,
        ingredients: [ingredient("Bone-in pork shoulder", 3, "kg"), ingredient("Kosher salt", 2, "tbsp"), ingredient("Black pepper", 2, "tbsp"), ingredient("Mustard", 2, "tbsp")],
        setup: ["Trim only loose fat and apply a salt-and-pepper rub", "Run indirect at 120°C with a drip pan", "Use post oak or hickory", "Place the shoulder fat side up"],
        phases: [phase("Smoke", "Smoke until bark is set and the core reaches 70°C", 120, 70), phase("Wrap", "Wrap when the bark is set and cook until probe tender", 130, 94), phase("Rest", "Rest wrapped for at least 45 minutes")]
    }),
    bbqRecipe({
        id: "spare_ribs", name: "Texas Spare Ribs", category: "Pork",
        meat: "St. Louis-cut spare ribs", dome: 135, target: 93, duration: "5-6 hours", baseServings: 4,
        ingredients: [ingredient("St. Louis-cut spare ribs", 2, "kg"), ingredient("Kosher salt", 2, "tbsp"), ingredient("Black pepper", 2, "tbsp"), ingredient("Apple cider vinegar", 150, "ml")],
        setup: ["Remove the membrane and square the rack", "Run indirect at 135°C", "Use oak or pecan", "Keep a light spritz ready after the bark forms"],
        phases: [phase("Smoke", "Smoke unwrapped until the bark is set", 135, 75), phase("Wrap", "Wrap with a little cider and cook until tender", 145, 93), phase("Finish", "Unwrap, sauce lightly, and set the glaze", 150, 93), phase("Rest", "Rest for 15 minutes")]
    }),
    bbqRecipe({
        id: "baby_back_ribs", name: "Peppery Baby Back Ribs", category: "Pork",
        meat: "Baby back ribs", dome: 135, target: 92, duration: "4-5 hours", baseServings: 4,
        ingredients: [ingredient("Baby back ribs", 1.5, "kg"), ingredient("Kosher salt", 1, "tbsp"), ingredient("Black pepper", 1, "tbsp"), ingredient("BBQ sauce", 150, "ml")],
        setup: ["Remove the membrane and season overnight", "Run indirect at 135°C", "Use a mild pecan or apple chunk", "Keep the final sauce layer thin"],
        phases: [phase("Smoke", "Smoke until the bark is set", 135, 72), phase("Wrap", "Wrap until the ribs are tender and flexible", 145, 92), phase("Finish", "Sauce and set the glaze uncovered", 150, 92), phase("Rest", "Rest for 10 minutes")]
    }),
    bbqRecipe({
        id: "pork_belly_burnt_ends", name: "Pork Belly Burnt Ends", category: "Pork",
        meat: "Skinless pork belly", dome: 135, target: 94, duration: "5-6 hours", baseServings: 6,
        ingredients: [ingredient("Skinless pork belly", 2, "kg"), ingredient("BBQ rub", 4, "tbsp"), ingredient("Butter", 75, "g"), ingredient("BBQ sauce", 200, "ml")],
        setup: ["Cut the pork belly into 4 cm cubes", "Run indirect at 135°C with a drip pan", "Use hickory or oak", "Use a shallow pan for the braise phase"],
        phases: [phase("Smoke", "Smoke cubes until the bark is dark", 135, 75), phase("Braise", "Cover with butter and sauce until probe tender", 150, 94), phase("Set", "Uncover and reduce the glaze", 160, 94), phase("Rest", "Rest for 15 minutes")]
    }),
    bbqRecipe({
        id: "pork_belly", name: "Oak-Smoked Pork Belly", category: "Pork",
        meat: "Pork belly slab", dome: 135, target: 90, duration: "5-7 hours", baseServings: 6,
        ingredients: [ingredient("Pork belly slab", 2, "kg"), ingredient("Kosher salt", 2, "tbsp"), ingredient("Black pepper", 2, "tbsp"), ingredient("Maple syrup", 100, "ml")],
        setup: ["Score the skin only if cooking skin-on", "Run indirect at 135°C", "Use apple or pecan smoke", "Finish over direct heat for crisp edges"],
        phases: [phase("Smoke", "Smoke until the core reaches 75°C", 135, 75), phase("Finish", "Cook until tender and the fat is rendered", 150, 90), phase("Crisp", "Crisp the skin or edges over direct heat", 220, 90), phase("Rest", "Rest for 20 minutes")]
    }),
    bbqRecipe({
        id: "pork_shoulder_steaks", name: "Pork Shoulder Steaks", category: "Pork",
        meat: "Cut pork shoulder steaks", dome: 150, target: 88, duration: "2.5-3 hours", baseServings: 4,
        ingredients: [ingredient("Pork shoulder steaks", 1.2, "kg"), ingredient("BBQ rub", 3, "tbsp"), ingredient("Apple juice", 200, "ml"), ingredient("BBQ sauce", 150, "ml")],
        setup: ["Season the steaks generously", "Run indirect at 150°C", "Use apple or cherry wood", "Prepare a direct zone for finishing the sauce"],
        phases: [phase("Smoke", "Smoke until the core reaches 70°C", 150, 70), phase("Braise", "Cover with apple juice until tender", 160, 88), phase("Glaze", "Set the sauce over direct heat", 200, 88), phase("Rest", "Rest for 10 minutes")]
    }),
    bbqRecipe({
        id: "pork_loin", name: "Applewood Pork Loin", category: "Pork",
        meat: "Pork loin roast", dome: 160, target: 63, duration: "1.5-2 hours", baseServings: 4,
        ingredients: [ingredient("Pork loin roast", 1.2, "kg"), ingredient("Mustard", 1, "tbsp"), ingredient("BBQ rub", 2, "tbsp"), ingredient("Applewood jelly", 2, "tbsp")],
        setup: ["Coat with mustard and a light rub", "Run indirect at 160°C", "Use one applewood chunk", "Glaze during the final phase"],
        phases: [phase("Smoke", "Smoke until the core reaches 58°C", 160, 58), phase("Glaze", "Brush with glaze and finish to 63°C", 170, 63), phase("Rest", "Rest for 15 minutes")]
    }),
    bbqRecipe({
        id: "pork_chops", name: "Thick-Cut Pork Chops", category: "Pork",
        meat: "Bone-in pork chops", dome: 150, target: 63, duration: "45-60 minutes", baseServings: 4,
        ingredients: [ingredient("Thick-cut pork chops", 1, "kg"), ingredient("Kosher salt", 2, "tsp"), ingredient("Black pepper", 2, "tsp"), ingredient("Peach preserves", 3, "tbsp")],
        setup: ["Dry-brine the chops for at least two hours", "Run indirect at 150°C", "Use a small peach or apple chunk", "Finish over direct heat"],
        phases: [phase("Smoke", "Smoke until the core reaches 55°C", 150, 55), phase("Sear", "Sear and glaze to a 63°C core", 220, 63), phase("Rest", "Rest for 8 minutes")]
    }),
    bbqRecipe({
        id: "pork_tenderloin", name: "Smoked Pork Tenderloin", category: "Pork",
        meat: "Pork tenderloin", dome: 170, target: 63, duration: "45-60 minutes", baseServings: 4,
        ingredients: [ingredient("Pork tenderloin", 700, "g"), ingredient("Mustard", 1, "tbsp"), ingredient("BBQ rub", 2, "tbsp"), ingredient("Honey", 1, "tbsp")],
        setup: ["Trim the silver skin and apply a thin binder", "Run indirect at 170°C", "Use a small applewood chunk", "Sear briefly if extra color is needed"],
        phases: [phase("Smoke", "Smoke until the core reaches 58°C", 170, 58), phase("Glaze", "Brush with honey and finish to 63°C", 180, 63), phase("Rest", "Rest for 10 minutes")]
    }),
    bbqRecipe({
        id: "pork_sausage", name: "Smoked Pork Sausage", category: "Pork",
        meat: "Fresh pork sausage", dome: 120, target: 71, duration: "1.5-2 hours", baseServings: 4,
        ingredients: [ingredient("Fresh pork sausage", 1, "kg"), ingredient("Yellow mustard", 4, "tbsp"), ingredient("Pickles", 200, "g")],
        setup: ["Keep the sausages cold until they go on the grill", "Run indirect at 120°C", "Use pecan or oak smoke", "Avoid piercing the casings"],
        phases: [phase("Smoke", "Smoke gently until the core reaches 68°C", 120, 68), phase("Finish", "Finish to a safe 71°C core", 150, 71), phase("Rest", "Rest for 5 minutes")]
    }),
    bbqRecipe({
        id: "country_ham", name: "Kamado-Smoked Ham", category: "Pork",
        meat: "Fully cooked ham", dome: 135, target: 60, duration: "2.5-3.5 hours", baseServings: 8,
        ingredients: [ingredient("Fully cooked ham", 3, "kg"), ingredient("Brown sugar", 100, "g"), ingredient("Mustard", 3, "tbsp"), ingredient("Apple juice", 200, "ml")],
        setup: ["Score the surface and apply the mustard glaze", "Run indirect at 135°C with a drip pan", "Use apple or pecan smoke", "Add glaze in thin layers"],
        phases: [phase("Smoke", "Warm the ham until the core reaches 50°C", 135, 50), phase("Glaze", "Apply glaze and finish to 60°C", 150, 60), phase("Rest", "Rest for 20 minutes")]
    }),
    bbqRecipe({
        id: "pork_ribs_hot_fast", name: "Hot-and-Fast Pork Ribs", category: "Pork",
        meat: "St. Louis spare ribs", dome: 175, target: 93, duration: "3.5-4.5 hours", baseServings: 4,
        ingredients: [ingredient("St. Louis spare ribs", 2, "kg"), ingredient("Kosher salt", 2, "tbsp"), ingredient("Black pepper", 2, "tbsp"), ingredient("BBQ sauce", 150, "ml")],
        setup: ["Remove the membrane and season the ribs", "Run indirect at 175°C", "Use oak or pecan", "Wrap once the bark is set"],
        phases: [phase("Smoke", "Cook until the bark is set", 175, 78), phase("Wrap", "Wrap until tender and the core is about 93°C", 180, 93), phase("Finish", "Sauce and set the glaze uncovered", 190, 93), phase("Rest", "Rest for 10 minutes")]
    }),
    bbqRecipe({
        id: "pork_steaks", name: "St. Louis Pork Steaks", category: "Pork",
        meat: "Pork shoulder steaks", dome: 150, target: 88, duration: "2.5-3 hours", baseServings: 4,
        ingredients: [ingredient("Pork shoulder steaks", 1.2, "kg"), ingredient("BBQ rub", 3, "tbsp"), ingredient("Beer", 250, "ml"), ingredient("BBQ sauce", 150, "ml")],
        setup: ["Season the steaks and stabilize the Kamado", "Run indirect at 150°C with oak smoke", "Use a covered pan for the braise", "Finish directly over the grate"],
        phases: [phase("Smoke", "Smoke until the core reaches 72°C", 150, 72), phase("Braise", "Cover with beer and sauce until tender", 160, 88), phase("Finish", "Set the sauce over direct heat", 210, 88), phase("Rest", "Rest for 10 minutes")]
    }),
    bbqRecipe({
        id: "spatchcock_chicken", name: "Texas Spatchcock Chicken", category: "Poultry",
        meat: "Whole chicken", dome: 180, target: 74, duration: "1.5-2 hours", baseServings: 4,
        ingredients: [ingredient("Whole chicken", 1.8, "kg"), ingredient("Kosher salt", 2, "tsp"), ingredient("Black pepper", 2, "tsp"), ingredient("Paprika", 1, "tbsp")],
        setup: ["Spatchcock the chicken and dry the skin", "Run indirect at 180°C with a drip pan", "Use pecan or apple smoke", "Finish skin-side down over direct heat if needed"],
        phases: [phase("Smoke", "Cook until the breast reaches 68°C", 180, 68), phase("Finish", "Crisp the skin and finish the breast to 74°C", 220, 74), phase("Rest", "Rest for 10 minutes")]
    }),
    bbqRecipe({
        id: "whole_chicken", name: "Oak-Smoked Whole Chicken", category: "Poultry",
        meat: "Whole chicken", dome: 175, target: 74, duration: "1.5-2 hours", baseServings: 4,
        ingredients: [ingredient("Whole chicken", 1.8, "kg"), ingredient("Butter", 50, "g"), ingredient("Poultry rub", 3, "tbsp"), ingredient("Lemon", 1, null)],
        setup: ["Dry the chicken and season under the skin", "Run indirect at 175°C", "Use a small oak or pecan chunk", "Place a drip pan below the bird"],
        phases: [phase("Smoke", "Smoke until the breast reaches 68°C", 175, 68), phase("Finish", "Finish until the breast reaches 74°C", 190, 74), phase("Rest", "Rest for 15 minutes")]
    }),
    bbqRecipe({
        id: "chicken_thighs", name: "Crisp-Skin Chicken Thighs", category: "Poultry",
        meat: "Bone-in chicken thighs", dome: 190, target: 80, duration: "60-75 minutes", baseServings: 4,
        ingredients: [ingredient("Bone-in chicken thighs", 1.2, "kg"), ingredient("Kosher salt", 2, "tsp"), ingredient("Paprika", 1, "tbsp"), ingredient("BBQ sauce", 100, "ml")],
        setup: ["Dry the skin thoroughly and season under it", "Run indirect at 190°C", "Use a small fruitwood chunk", "Finish skin-side down over direct heat"],
        phases: [phase("Smoke", "Cook until the core reaches 72°C", 190, 72), phase("Crisp", "Crisp the skin and finish to 80°C", 230, 80), phase("Rest", "Rest for 8 minutes")]
    }),
    bbqRecipe({
        id: "chicken_wings", name: "Oak-Smoked Chicken Wings", category: "Poultry",
        meat: "Chicken wings", dome: 150, target: 75, duration: "75-90 minutes", baseServings: 4,
        ingredients: [ingredient("Chicken wings", 1.2, "kg"), ingredient("Baking powder", 1, "tbsp"), ingredient("BBQ rub", 3, "tbsp"), ingredient("Hot sauce", 100, "ml")],
        setup: ["Dry the wings and toss with baking powder and rub", "Run indirect at 150°C", "Use pecan or oak smoke", "Finish at high heat for crisp skin"],
        phases: [phase("Smoke", "Smoke until the core reaches 68°C", 150, 68), phase("Crisp", "Raise the heat and finish to 75°C", 230, 75), phase("Toss", "Toss with sauce and serve", null, null)]
    }),
    bbqRecipe({
        id: "chicken_drumsticks", name: "Barbecue Chicken Drumsticks", category: "Poultry",
        meat: "Chicken drumsticks", dome: 180, target: 78, duration: "75-90 minutes", baseServings: 4,
        ingredients: [ingredient("Chicken drumsticks", 1.2, "kg"), ingredient("BBQ rub", 3, "tbsp"), ingredient("Mustard", 2, "tbsp"), ingredient("BBQ sauce", 150, "ml")],
        setup: ["Coat with mustard and rub", "Run indirect at 180°C", "Use a drip pan and a small fruitwood chunk", "Sauce only after the skin has rendered"],
        phases: [phase("Smoke", "Smoke until the core reaches 70°C", 180, 70), phase("Glaze", "Brush with sauce and finish to 78°C", 200, 78), phase("Rest", "Rest for 8 minutes")]
    }),
    bbqRecipe({
        id: "smoked_turkey", name: "Oak-Smoked Whole Turkey", category: "Poultry",
        meat: "Whole turkey", dome: 150, target: 74, duration: "4-5 hours", baseServings: 10,
        ingredients: [ingredient("Whole turkey", 5, "kg"), ingredient("Kosher salt", 4, "tbsp"), ingredient("Butter", 150, "g"), ingredient("Poultry rub", 4, "tbsp")],
        setup: ["Dry-brine the turkey overnight", "Run indirect at 150°C with a large drip pan", "Use apple or pecan smoke", "Shield the breast with foil if it colors early"],
        phases: [phase("Smoke", "Smoke until the breast reaches 60°C", 150, 60), phase("Finish", "Finish until breast reaches 74°C and thigh 80°C", 165, 74), phase("Rest", "Rest for 30 minutes")]
    }),
    bbqRecipe({
        id: "turkey_breast", name: "Smoked Turkey Breast", category: "Poultry",
        meat: "Bone-in turkey breast", dome: 150, target: 74, duration: "2-3 hours", baseServings: 6,
        ingredients: [ingredient("Bone-in turkey breast", 2, "kg"), ingredient("Kosher salt", 2, "tbsp"), ingredient("Butter", 75, "g"), ingredient("Poultry rub", 2, "tbsp")],
        setup: ["Dry-brine the breast overnight", "Run indirect at 150°C", "Use apple or pecan smoke", "Baste once after the skin has set"],
        phases: [phase("Smoke", "Smoke until the core reaches 65°C", 150, 65), phase("Finish", "Finish to a 74°C core", 165, 74), phase("Rest", "Rest for 20 minutes")]
    }),
    bbqRecipe({
        id: "turkey_legs", name: "Smoked Turkey Legs", category: "Poultry",
        meat: "Turkey legs", dome: 160, target: 80, duration: "2.5-3 hours", baseServings: 4,
        ingredients: [ingredient("Turkey legs", 1.8, "kg"), ingredient("Kosher salt", 2, "tbsp"), ingredient("Brown sugar", 2, "tbsp"), ingredient("Poultry rub", 2, "tbsp")],
        setup: ["Dry-brine the legs overnight", "Run indirect at 160°C", "Use cherry or pecan smoke", "Finish directly for color"],
        phases: [phase("Smoke", "Smoke until the core reaches 70°C", 160, 70), phase("Finish", "Cook until tender at an 80°C core", 190, 80), phase("Rest", "Rest for 15 minutes")]
    }),
    bbqRecipe({
        id: "duck", name: "Crisp-Skin Smoked Duck", category: "Poultry",
        meat: "Whole duck", dome: 160, target: 74, duration: "2.5-3 hours", baseServings: 4,
        ingredients: [ingredient("Whole duck", 2.2, "kg"), ingredient("Kosher salt", 2, "tbsp"), ingredient("Five-spice", 1, "tbsp"), ingredient("Orange", 1, null)],
        setup: ["Dry the duck uncovered overnight", "Run indirect at 160°C with a deep drip pan", "Use cherry or oak smoke", "Finish at high heat to render the skin"],
        phases: [phase("Smoke", "Smoke until the breast reaches 62°C", 160, 62), phase("Crisp", "Crisp the skin and finish to 74°C", 220, 74), phase("Rest", "Rest for 15 minutes")]
    }),
    bbqRecipe({
        id: "quail", name: "Smoked Quail", category: "Poultry",
        meat: "Whole quail", dome: 180, target: 70, duration: "35-45 minutes", baseServings: 4,
        ingredients: [ingredient("Whole quail", 4, null), ingredient("Kosher salt", 2, "tsp"), ingredient("Black pepper", 1, "tsp"), ingredient("Butter", 30, "g")],
        setup: ["Spatchcock the quail and season under the skin", "Run indirect at 180°C", "Use a small fruitwood chunk", "Finish directly only if the skin needs color"],
        phases: [phase("Smoke", "Smoke until the core reaches 65°C", 180, 65), phase("Finish", "Finish to a 70°C core", 200, 70), phase("Rest", "Rest for 5 minutes")]
    }),
    bbqRecipe({
        id: "lamb_shoulder", name: "Texas-Style Lamb Shoulder", category: "Lamb",
        meat: "Bone-in lamb shoulder", dome: 130, target: 94, duration: "6-8 hours", baseServings: 6,
        ingredients: [ingredient("Bone-in lamb shoulder", 2.5, "kg"), ingredient("Kosher salt", 2, "tbsp"), ingredient("Black pepper", 2, "tbsp"), ingredient("Ground cumin", 1, "tbsp")],
        setup: ["Trim only excess fat and season generously", "Run indirect at 130°C", "Use oak or pecan smoke", "Place a drip pan beneath the shoulder"],
        phases: [phase("Smoke", "Smoke until bark is set and the core reaches 70°C", 130, 70), phase("Wrap", "Wrap and cook until probe tender", 140, 94), phase("Rest", "Rest wrapped for 45 minutes")]
    }),
    bbqRecipe({
        id: "lamb_leg", name: "Oak-Smoked Leg of Lamb", category: "Lamb",
        meat: "Leg of lamb", dome: 150, target: 60, duration: "2.5-3.5 hours", baseServings: 6,
        ingredients: [ingredient("Leg of lamb", 2, "kg"), ingredient("Garlic", 6, null), ingredient("Rosemary", 3, "tbsp"), ingredient("Olive oil", 3, "tbsp")],
        setup: ["Marinate with garlic, rosemary, and oil", "Run indirect at 150°C", "Use oak or cherry smoke", "Prepare a direct zone for browning"],
        phases: [phase("Smoke", "Smoke until the core reaches 52°C", 150, 52), phase("Sear", "Brown over direct heat to a 60°C core", 230, 60), phase("Rest", "Rest for 20 minutes")]
    }),
    bbqRecipe({
        id: "lamb_chops", name: "Smoked Lamb Chops", category: "Lamb",
        meat: "Thick lamb chops", dome: 140, target: 60, duration: "45-60 minutes", baseServings: 4,
        ingredients: [ingredient("Thick lamb chops", 800, "g"), ingredient("Kosher salt", 2, "tsp"), ingredient("Black pepper", 1, "tsp"), ingredient("Rosemary", 1, "tbsp")],
        setup: ["Season the chops and rest at room temperature", "Run indirect at 140°C", "Use a small oak chunk", "Finish over a hot direct zone"],
        phases: [phase("Smoke", "Smoke until the core reaches 50°C", 140, 50), phase("Sear", "Sear to a 60°C core", 240, 60), phase("Rest", "Rest for 8 minutes")]
    }),
    bbqRecipe({
        id: "lamb_ribs", name: "Barbecue Lamb Ribs", category: "Lamb",
        meat: "Lamb ribs", dome: 135, target: 90, duration: "4-5 hours", baseServings: 4,
        ingredients: [ingredient("Lamb ribs", 1.5, "kg"), ingredient("Kosher salt", 1, "tbsp"), ingredient("Black pepper", 1, "tbsp"), ingredient("Pomegranate molasses", 100, "ml")],
        setup: ["Trim excess surface fat and season", "Run indirect at 135°C", "Use oak smoke", "Glaze only after the fat has rendered"],
        phases: [phase("Smoke", "Smoke until bark forms", 135, 75), phase("Finish", "Cook until tender near a 90°C core", 150, 90), phase("Glaze", "Brush with molasses and set the glaze", 190, 90), phase("Rest", "Rest for 10 minutes")]
    }),
    bbqRecipe({
        id: "lamb_kofta", name: "Smoked Lamb Kofta", category: "Lamb",
        meat: "Ground lamb kofta", dome: 180, target: 71, duration: "35-45 minutes", baseServings: 4,
        ingredients: [ingredient("Ground lamb", 800, "g"), ingredient("Ground cumin", 2, "tsp"), ingredient("Black pepper", 1, "tsp"), ingredient("Fresh parsley", 3, "tbsp")],
        setup: ["Shape the kofta around skewers without packing tightly", "Run indirect at 180°C", "Use a small oak or cherry chunk", "Finish over direct heat for browning"],
        phases: [phase("Smoke", "Smoke until the core reaches 65°C", 180, 65), phase("Grill", "Brown and finish to a 71°C core", 220, 71), phase("Rest", "Rest for 5 minutes")]
    }),
    bbqRecipe({
        id: "cedar_salmon", name: "Cedar-Plank Salmon", category: "Seafood",
        meat: "Salmon side", dome: 160, target: 52, duration: "35-50 minutes", baseServings: 4,
        ingredients: [ingredient("Salmon side", 900, "g"), ingredient("Cedar plank", 1, null), ingredient("Kosher salt", 2, "tsp"), ingredient("Brown sugar", 2, "tbsp")],
        setup: ["Soak the cedar plank for at least one hour", "Run indirect at 160°C", "Do not add extra wood; the plank is enough", "Keep the lid closed while the plank smokes"],
        phases: [phase("Smoke", "Cook until the thickest part reaches 48°C", 160, 48), phase("Finish", "Finish until the core reaches 52°C", 170, 52), phase("Rest", "Rest for 5 minutes")]
    }),
    bbqRecipe({
        id: "whole_trout", name: "Oak-Smoked Whole Trout", category: "Seafood",
        meat: "Whole trout", dome: 160, target: 60, duration: "35-45 minutes", baseServings: 2,
        ingredients: [ingredient("Whole trout", 2, null), ingredient("Lemon", 1, null), ingredient("Fresh dill", 2, "tbsp"), ingredient("Olive oil", 1, "tbsp")],
        setup: ["Clean and stuff the trout with lemon and dill", "Run indirect at 160°C", "Use a small alder or oak chunk", "Oil the grate or use a fish tray"],
        phases: [phase("Smoke", "Smoke until the core reaches 55°C", 160, 55), phase("Finish", "Finish to a 60°C core and flaky flesh", 170, 60), phase("Rest", "Rest for 5 minutes")]
    }),
    bbqRecipe({
        id: "smoked_shrimp", name: "Hot-Smoked Gulf Shrimp", category: "Seafood",
        meat: "Large shrimp", dome: 180, target: 63, duration: "20-30 minutes", baseServings: 4,
        ingredients: [ingredient("Large shrimp", 800, "g"), ingredient("Butter", 50, "g"), ingredient("Garlic", 3, null), ingredient("Cajun seasoning", 1, "tbsp")],
        setup: ["Shell and devein the shrimp", "Run indirect at 180°C in a cast-iron pan", "Use a small pecan chunk", "Finish directly only for a brief sear"],
        phases: [phase("Smoke", "Cook until the shrimp are nearly opaque", 180, 60), phase("Finish", "Finish to a 63°C core", 200, 63), phase("Serve", "Serve immediately", null, null)]
    }),
    bbqRecipe({
        id: "smoked_tuna", name: "Pepper-Crusted Smoked Tuna", category: "Seafood",
        meat: "Tuna loin", dome: 120, target: 50, duration: "30-45 minutes", baseServings: 4,
        ingredients: [ingredient("Tuna loin", 800, "g"), ingredient("Kosher salt", 2, "tsp"), ingredient("Black pepper", 2, "tbsp"), ingredient("Sesame seeds", 1, "tbsp")],
        setup: ["Dry the tuna and press in the pepper crust", "Run indirect at 120°C", "Use a small oak chunk", "Prepare a direct zone for a fast sear"],
        phases: [phase("Smoke", "Smoke until the core reaches 42°C", 120, 42), phase("Sear", "Sear briefly and finish to 50°C", 240, 50), phase("Rest", "Rest for 5 minutes")]
    }),
    bbqRecipe({
        id: "jalapeno_poppers", name: "Texas Jalapeño Poppers", category: "BBQ Sides",
        meat: "Jalapeño poppers", dome: 180, target: 74, duration: "35-45 minutes", baseServings: 6,
        ingredients: [ingredient("Jalapeños", 12, null), ingredient("Cream cheese", 250, "g"), ingredient("Bacon", 12, null), ingredient("Cheddar", 150, "g")],
        setup: ["Halve and seed the jalapeños", "Fill with cheese and wrap with bacon", "Run indirect at 180°C", "Use a small pecan chunk"],
        phases: [phase("Smoke", "Smoke until the bacon is rendered and the filling reaches 70°C", 180, 70), phase("Finish", "Finish until the core reaches 74°C", 200, 74), phase("Rest", "Rest for 5 minutes")]
    }),
    bbqRecipe({
        id: "texas_pit_beans", name: "Texas Pit Beans", category: "BBQ Sides",
        meat: "Pit beans", dome: 150, target: null, duration: "2-3 hours", baseServings: 8,
        ingredients: [ingredient("Pinto beans, cooked", 1.2, "kg"), ingredient("Bacon", 250, "g"), ingredient("Onion", 1, null), ingredient("BBQ sauce", 200, "ml")],
        setup: ["Brown the bacon in a cast-iron Dutch oven", "Add beans, onion, and sauce", "Run indirect at 150°C with oak smoke", "Stir occasionally while the sauce reduces"],
        phases: [phase("Smoke", "Smoke uncovered until the beans take on bark", 150, null), phase("Simmer", "Cover and simmer until thick and rich", 160, null), phase("Serve", "Serve hot from the Dutch oven", null, null)]
    }),
    bbqRecipe({
        id: "jalapeno_cornbread", name: "Kamado Jalapeño Cornbread", category: "BBQ Sides",
        meat: "Cornbread", dome: 190, target: null, duration: "35-45 minutes", baseServings: 8,
        ingredients: [ingredient("Cornmeal", 250, "g"), ingredient("Plain flour", 150, "g"), ingredient("Buttermilk", 350, "ml"), ingredient("Jalapeños", 2, null)],
        setup: ["Preheat a cast-iron skillet in the Kamado", "Run indirect at 190°C", "Use a clean fire with no extra smoke wood", "Grease the hot skillet before adding batter"],
        phases: [phase("Bake", "Bake until golden and set in the center", 190, null), phase("Rest", "Rest in the skillet for 10 minutes", null, null)]
    })
];
