/* ==========================================================
   Hermanos Grill Companion
   recipes-data.js

   Recipe database
   ========================================================== */


appState.recipes = [

        {
            id: "pulled_pork", name: "Pulled Pork", category: "Pork",
            meat: "Pork shoulder", dome: 110, target: 92, duration: "10-12 hours",
            baseServings: 8, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Pork shoulder", amount: 3, unit: "kg" },
                { id: "i2", name: "Mustard (as binder)", amount: 2, unit: "tbsp" },
                { id: "i3", name: "BBQ rub", amount: 4, unit: "tbsp" },
                { id: "i4", name: "Apple juice (spritz)", amount: 250, unit: "ml" },
                { id: "i5", name: "BBQ sauce", amount: 200, unit: "ml" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Fill with charcoal to just below the fire ring",
                "Add 2-3 pieces of apple or cherry wood",
                "Stabilize the dome at 110°C before placing the meat"
            ],
            phases: [
                ["Smoke", "110°C to core 65°C"],
                ["Wrap", "Wrap until core reaches 92°C"],
                ["Rest", "Rest for at least 30 minutes"]
            ]
        },

        {
            id: "ribs", name: "Spare Ribs 3-2-1", category: "Pork",
            meat: "Spare ribs", dome: 107, target: 88, duration: "6 hours",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Spare ribs", amount: 2, unit: "kg" },
                { id: "i2", name: "BBQ rub", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Apple juice (spritz)", amount: 200, unit: "ml" },
                { id: "i4", name: "Honey", amount: 2, unit: "tbsp" },
                { id: "i5", name: "BBQ sauce", amount: 150, unit: "ml" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Remove the membrane from the back of the rack",
                "Add cherry or oak wood for smoke",
                "Stabilize the dome at 107°C"
            ],
            phases: [
                ["Smoke", "3 hours unwrapped"],
                ["Wrap", "2 hours wrapped in foil with moisture"],
                ["Finish", "1 hour unwrapped with sauce"]
            ]
        },

        {
            id: "baby_back_ribs", name: "Baby Back Ribs", category: "Pork",
            meat: "Baby back ribs", dome: 110, target: 90, duration: "5 hours",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Baby back ribs", amount: 1.5, unit: "kg" },
                { id: "i2", name: "BBQ rub", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Apple cider vinegar (spritz)", amount: 150, unit: "ml" },
                { id: "i4", name: "BBQ sauce", amount: 150, unit: "ml" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Remove the membrane and pat dry",
                "Add apple wood for mild smoke",
                "Stabilize the dome at 110°C"
            ],
            phases: [
                ["Smoke", "3 hours unwrapped"],
                ["Wrap", "1.5 hours wrapped in foil"],
                ["Finish", "30 minutes glazing with sauce"]
            ]
        },

        {
            id: "brisket", name: "Beef Brisket", category: "Beef",
            meat: "Beef brisket", dome: 110, target: 96, duration: "14 hours",
            baseServings: 10, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Beef brisket", amount: 5, unit: "kg" },
                { id: "i2", name: "Coarse sea salt", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Coarse black pepper", amount: 3, unit: "tbsp" },
                { id: "i4", name: "Butcher paper / injection liquid", amount: 100, unit: "ml" }
            ],
            setup: [
                "Indirect setup with deflector plates and drip pan",
                "Trim the fat cap to about 0.5 cm",
                "Add oak for a fuller smoke flavor",
                "Stabilize the dome at 110°C with the fat cap facing upward"
            ],
            phases: [
                ["Smoke", "110°C until core reaches 70°C (the stall)"],
                ["Wrap", "Wrap in butcher paper until core reaches 96°C"],
                ["Rest", "Rest for at least 1 hour in a towel or cooler"]
            ]
        },

        {
            id: "beer_can_chicken", name: "Beer Can Chicken", category: "Poultry",
            meat: "Whole chicken", dome: 180, target: 82, duration: "1.5 hours",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Whole chicken", amount: 1.6, unit: "kg" },
                { id: "i2", name: "Chicken seasoning rub", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Beer (can)", amount: 330, unit: "ml" },
                { id: "i4", name: "Olive oil", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Empty the beer can by one-third and place the chicken on top",
                "Add cherry wood for light smoke",
                "Stabilize the dome at 180°C"
            ],
            phases: [
                ["Smoke", "180°C to core 65°C"],
                ["Finish", "Until the thighs reach 82°C"],
                ["Rest", "Rest for 10 minutes"]
            ]
        },

        {
            id: "spatchcock_chicken", name: "Spatchcock Chicken", category: "Poultry",
            meat: "Whole chicken (spatchcocked)", dome: 200, target: 75, duration: "1 hour",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Whole chicken", amount: 1.8, unit: "kg" },
                { id: "i2", name: "Melted butter", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Chicken seasoning rub", amount: 3, unit: "tbsp" },
                { id: "i4", name: "Lemon", amount: 1, unit: null }
            ],
            setup: [
                "Remove the spine and flatten the chicken",
                "Indirect setup, skin facing the heat",
                "Add apple wood for smoke",
                "Stabilize the dome at 200°C"
            ],
            phases: [
                ["Grill", "200°C indirect until core reaches 65°C"],
                ["Finish", "Crisp the skin until core reaches 75°C"],
                ["Rest", "Rest for 10 minutes"]
            ]
        },

        {
            id: "burnt_ends", name: "Pork Belly Burnt Ends", category: "Pork",
            meat: "Pork belly", dome: 120, target: 93, duration: "5 hours",
            baseServings: 6, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Pork belly (without rind)", amount: 2, unit: "kg" },
                { id: "i2", name: "BBQ rub", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Honey", amount: 3, unit: "tbsp" },
                { id: "i4", name: "BBQ sauce", amount: 200, unit: "ml" },
                { id: "i5", name: "Butter", amount: 50, unit: "g" }
            ],
            setup: [
                "Cut the pork belly into 3 cm cubes",
                "Indirect setup with deflector plates",
                "Add cherry wood for smoke",
                "Stabilize the dome at 120°C"
            ],
            phases: [
                ["Smoke", "120°C until core reaches 75°C"],
                ["Braise", "In a pan with butter and honey until 93°C"],
                ["Glaze", "Reduce with sauce for 15 minutes"]
            ]
        },

        {
            id: "short_ribs", name: "Beef Short Ribs", category: "Beef",
            meat: "Beef short ribs", dome: 120, target: 95, duration: "7 hours",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Short ribs", amount: 2, unit: "kg" },
                { id: "i2", name: "Coarse sea salt", amount: 2, unit: "tbsp" },
                { id: "i3", name: "Coarse black pepper", amount: 2, unit: "tbsp" },
                { id: "i4", name: "Beef stock (spritz)", amount: 200, unit: "ml" }
            ],
            setup: [
                "Indirect setup with deflector plates and drip pan",
                "Remove the membrane on the underside",
                "Add oak for a full smoke flavor",
                "Stabilize the dome at 120°C"
            ],
            phases: [
                ["Smoke", "120°C until core reaches 70°C"],
                ["Wrap", "Wrap until core reaches 95°C"],
                ["Rest", "Rest for 20 minutes"]
            ]
        },

        {
            id: "tri_tip", name: "Tri-Tip", category: "Beef",
            meat: "Tri-tip steak", dome: 120, target: 54, duration: "1.5 hours",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Tri-tip", amount: 1, unit: "kg" },
                { id: "i2", name: "Coarse sea salt", amount: 1, unit: "tbsp" },
                { id: "i3", name: "Garlic powder", amount: 1, unit: "tbsp" },
                { id: "i4", name: "Coarse black pepper", amount: 1, unit: "tbsp" }
            ],
            setup: [
                "Reverse sear: first indirect, then direct sear",
                "Place the deflector plates for the smoke phase",
                "Add oak wood",
                "Stabilize the dome at 120°C"
            ],
            phases: [
                ["Smoke", "120°C indirect until core reaches 48°C"],
                ["Sear", "260°C direct, 1-2 minutes per side"],
                ["Rest", "Rest for 10 minutes"]
            ]
        },

        {
            id: "prime_rib", name: "Prime Rib", category: "Beef",
            meat: "Ribeye roast", dome: 130, target: 54, duration: "3 hours",
            baseServings: 6, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Ribeye roast (bone-in)", amount: 2.5, unit: "kg" },
                { id: "i2", name: "Coarse sea salt", amount: 2, unit: "tbsp" },
                { id: "i3", name: "Fresh rosemary", amount: 2, unit: "tbsp" },
                { id: "i4", name: "Melted butter", amount: 50, unit: "g" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Bring the meat to room temperature",
                "Add oak for mild smoke",
                "Stabilize the dome at 130°C"
            ],
            phases: [
                ["Smoke", "130°C until core reaches 48°C"],
                ["Sear", "260°C direct for crust"],
                ["Rest", "Rest for 15 minutes"]
            ]
        },

        {
            id: "leg_of_lamb", name: "Leg of Lamb", category: "Lamb",
            meat: "Leg of lamb", dome: 150, target: 60, duration: "3 hours",
            baseServings: 6, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Leg of lamb (bone removed)", amount: 2, unit: "kg" },
                { id: "i2", name: "Garlic cloves", amount: 4, unit: null },
                { id: "i3", name: "Rosemary", amount: 3, unit: "tbsp" },
                { id: "i4", name: "Olive oil", amount: 3, unit: "tbsp" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Score the meat and marinate with garlic and oil",
                "Add oak wood",
                "Stabilize the dome at 150°C"
            ],
            phases: [
                ["Grill", "150°C indirect until core reaches 55°C"],
                ["Sear", "Briefly direct for crust"],
                ["Rest", "Rest for 15 minutes"]
            ]
        },

        {
            id: "lamb_shoulder", name: "Lamb Shoulder", category: "Lamb",
            meat: "Lamb shoulder", dome: 120, target: 92, duration: "6 hours",
            baseServings: 6, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Lamb shoulder", amount: 1.8, unit: "kg" },
                { id: "i2", name: "Ground cumin", amount: 1, unit: "tbsp" },
                { id: "i3", name: "Paprika powder", amount: 1, unit: "tbsp" },
                { id: "i4", name: "Olive oil", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Coat the meat with the spice mix",
                "Add cherry wood",
                "Stabilize the dome at 120°C"
            ],
            phases: [
                ["Smoke", "120°C until core reaches 70°C"],
                ["Wrap", "Wrap until core reaches 92°C"],
                ["Rest", "Rest for 20 minutes, then pull"]
            ]
        },

        {
            id: "smoked_turkey", name: "Smoked Turkey", category: "Poultry",
            meat: "Whole turkey", dome: 150, target: 74, duration: "4 hours",
            baseServings: 10, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Whole turkey", amount: 5, unit: "kg" },
                { id: "i2", name: "Brine (salt)", amount: 200, unit: "g" },
                { id: "i3", name: "Melted butter", amount: 100, unit: "g" },
                { id: "i4", name: "Poultry seasoning", amount: 3, unit: "tbsp" }
            ],
            setup: [
                "Brine the turkey 12 hours in advance",
                "Indirect setup with deflector plates and drip pan",
                "Add apple wood for smoke",
                "Stabilize the dome at 150°C"
            ],
            phases: [
                ["Smoke", "150°C until core reaches 60°C"],
                ["Finish", "Until the breast reaches 74°C"],
                ["Rest", "Rest for 20 minutes"]
            ]
        },

        {
            id: "turkey_breast", name: "Turkey Breast", category: "Poultry",
            meat: "Turkey breast", dome: 150, target: 70, duration: "1.5 hours",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Turkey breast", amount: 1.2, unit: "kg" },
                { id: "i2", name: "Melted butter", amount: 2, unit: "tbsp" },
                { id: "i3", name: "Poultry seasoning", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Coat the breast with butter and seasoning",
                "Add apple wood",
                "Stabilize the dome at 150°C"
            ],
            phases: [
                ["Smoke", "150°C until core reaches 65°C"],
                ["Finish", "Until core reaches 70°C"],
                ["Rest", "Rest for 10 minutes"]
            ]
        },

        {
            id: "pork_loin", name: "Pork Loin", category: "Pork",
            meat: "Pork loin", dome: 150, target: 63, duration: "1.5 hours",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Pork loin", amount: 1.2, unit: "kg" },
                { id: "i2", name: "Mustard (as binder)", amount: 1, unit: "tbsp" },
                { id: "i3", name: "BBQ rub", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Coat the meat with mustard and rub",
                "Add apple wood",
                "Stabilize the dome at 150°C"
            ],
            phases: [
                ["Smoke", "150°C until core reaches 55°C"],
                ["Sear", "Briefly direct for crust"],
                ["Rest", "Rest for 10 minutes"]
            ]
        },

        {
            id: "cedar_salmon", name: "Cedar Salmon", category: "Fish",
            meat: "Salmon fillet", dome: 120, target: 52, duration: "45 minutes",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Salmon fillet (with skin)", amount: 800, unit: "g" },
                { id: "i2", name: "Brown sugar", amount: 2, unit: "tbsp" },
                { id: "i3", name: "Coarse sea salt", amount: 1, unit: "tbsp" },
                { id: "i4", name: "Dill", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Soak the cedar plank for at least 1 hour",
                "Indirect setup with deflector plates",
                "Place the salmon on the plank, no extra wood needed",
                "Stabilize the dome at 120°C"
            ],
            phases: [
                ["Smoke", "120°C until core reaches 48°C"],
                ["Finish", "Until core reaches 52°C and the flesh looks glossy"]
            ]
        },

        {
            id: "whole_trout", name: "Whole Trout", category: "Fish",
            meat: "Trout", dome: 130, target: 60, duration: "40 minutes",
            baseServings: 2, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Whole trout (cleaned)", amount: 500, unit: "g" },
                { id: "i2", name: "Lemon", amount: 1, unit: null },
                { id: "i3", name: "Fresh dill", amount: 2, unit: "tbsp" },
                { id: "i4", name: "Olive oil", amount: 1, unit: "tbsp" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Stuff the fish with lemon and dill",
                "Add alder wood for smoke",
                "Stabilize the dome at 130°C"
            ],
            phases: [
                ["Smoke", "130°C until core reaches 60°C"],
                ["Serve", "Serve immediately"]
            ]
        },

        {
            id: "pizza", name: "Kamado Pizza", category: "Other",
            meat: "Pizza", dome: 300, target: null, duration: "10 minutes",
            baseServings: 2, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Pizza flour (00)", amount: 250, unit: "g" },
                { id: "i2", name: "Water", amount: 150, unit: "ml" },
                { id: "i3", name: "Yeast", amount: 1, unit: "tsp" },
                { id: "i4", name: "Tomato sauce", amount: 100, unit: "ml" },
                { id: "i5", name: "Mozzarella", amount: 150, unit: "g" }
            ],
            setup: [
                "Warm the pizza stone for at least 30 minutes",
                "Direct setup without deflector",
                "Bring the dome up to 300°C",
                "Dust the pizza peel to prevent sticking"
            ],
            phases: [
                ["Preheat", "Bring the stone to 300°C"],
                ["Bake", "8-10 min until the crust is golden brown"]
            ]
        },

        {
            id: "mac_and_cheese", name: "Smoked Mac and Cheese", category: "Other",
            meat: "Side dish", dome: 150, target: null, duration: "1 hour",
            baseServings: 6, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Macaroni", amount: 500, unit: "g" },
                { id: "i2", name: "Cheddar (grated)", amount: 300, unit: "g" },
                { id: "i3", name: "Cream", amount: 300, unit: "ml" },
                { id: "i4", name: "Butter", amount: 50, unit: "g" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Par-cook the macaroni and mix with sauce in a cast-iron pan",
                "Add cherry wood for light smoke",
                "Stabilize the dome at 150°C"
            ],
            phases: [
                ["Smoke", "150°C, 45 minutes until bubbling"],
                ["Finish", "15 minutes extra for crust"]
            ]
        },

        {
            id: "dutch_oven_chili", name: "Dutch Oven Chili", category: "Other",
            meat: "Beef mince", dome: 150, target: null, duration: "2.5 hours",
            baseServings: 6, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Beef mince", amount: 1, unit: "kg" },
                { id: "i2", name: "Kidney beans (can)", amount: 400, unit: "g" },
                { id: "i3", name: "Peeled tomatoes (can)", amount: 800, unit: "g" },
                { id: "i4", name: "Onion", amount: 2, unit: null },
                { id: "i5", name: "Chili powder", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Brown the mince directly in the Dutch oven on the kamado",
                "Add oak for smoke flavor",
                "Stabilize the dome at 150°C"
            ],
            phases: [
                ["Sear", "Brown the beef and onion"],
                ["Simmer", "2 hours with the lid on the kamado"]
            ]
        },

        {
            id: "smoked_wings", name: "Smoked Chicken Wings", category: "Poultry",
            meat: "Chicken wings", dome: 130, target: 74, duration: "1.5 hours",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Chicken wings", amount: 1.2, unit: "kg" },
                { id: "i2", name: "BBQ rub", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Baking powder (for crispy skin)", amount: 1, unit: "tsp" },
                { id: "i4", name: "BBQ sauce", amount: 100, unit: "ml" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Pat dry the wings and dust with baking powder and rub",
                "Add apple wood",
                "Stabilize the dome at 130°C"
            ],
            phases: [
                ["Smoke", "130°C until core reaches 70°C"],
                ["Crisp", "180°C direct until core reaches 74°C"]
            ]
        },

        {
            id: "kielbasa", name: "Smoked Sausage", category: "Pork",
            meat: "Kielbasa", dome: 110, target: 70, duration: "2 hours",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Fresh sausage (kielbasa)", amount: 800, unit: "g" },
                { id: "i2", name: "Mustard (for serving)", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Indirect setup with deflector plates",
                "Bring the sausage to room temperature",
                "Add oak wood for a fuller smoke",
                "Stabilize the dome at 110°C"
            ],
            phases: [
                ["Smoke", "110°C until core reaches 70°C"],
                ["Serve", "Serve immediately"]
            ]
        },

        {
            id: "grilled_vegetables", name: "Grilled Vegetable Platter", category: "Vegetarian",
            meat: "Vegetables", dome: 200, target: null, duration: "25 minutes",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Mixed vegetables (zucchini, peppers, onion)", amount: 800, unit: "g" },
                { id: "i2", name: "Olive oil", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Garlic cloves", amount: 2, unit: null },
                { id: "i4", name: "Sea salt", amount: 1, unit: "tsp" }
            ],
            setup: [
                "Direct setup on the grill plate or in a grill basket",
                "Cut the vegetables into even pieces",
                "No extra wood needed",
                "Stabilize the dome at 200°C"
            ],
            phases: [
                ["Grill", "200°C direct, turning regularly"],
                ["Serve", "Serve immediately"]
            ]
        },

        {
            id: "smoked_cheese", name: "Smoked Cheese", category: "Vegetarian",
            meat: "Cheese", dome: 25, target: null, duration: "2 hours",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Cheese (e.g. young cheddar)", amount: 500, unit: "g" }
            ],
            setup: [
                "Use a cold smoke generator instead of regular coals",
                "Place the cheese on a rack above a drip tray",
                "Use apple wood shavings for gentle smoke",
                "Keep the dome as low as possible (max. 25°C) so the cheese does not melt"
            ],
            phases: [
                ["Cold smoke", "2 hours at max. 25°C"],
                ["Rest", "Allow to mature for at least 24 hours in the refrigerator"]
            ]
        },

        {
            id: "reverse_sear_ribeye", name: "Reverse Sear Ribeye", category: "Beef",
            meat: "Ribeye steak", dome: 120, target: 54, duration: "1 hour",
            baseServings: 2, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Ribeye steak (thick)", amount: 800, unit: "g" },
                { id: "i2", name: "Coarse sea salt", amount: 1, unit: "tbsp" },
                { id: "i3", name: "Coarse black pepper", amount: 1, unit: "tbsp" },
                { id: "i4", name: "Butter", amount: 30, unit: "g" }
            ],
            setup: [
                "Indirect setup with deflector plates for the smoke phase",
                "Remove the deflector for the direct sear phase",
                "Add oak wood",
                "Stabilize the dome at 120°C"
            ],
            phases: [
                ["Smoke", "120°C indirect until core reaches 48°C"],
                ["Sear", "260°C direct, 45-60 seconds per side"],
                ["Rest", "Rest for 5 minutes"]
            ]
        }

    ];
