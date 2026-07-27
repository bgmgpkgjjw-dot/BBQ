/* ==========================================================
   Hermanos Grill Companion
   recipes-data.js

   Recipe database
   ========================================================== */


appState.recipes = [

        {
            id: "pulled_pork", name: "Pulled Pork", category: "Varken",
            meat: "Varkensschouder", dome: 110, target: 92, duration: "10-12 uur",
            baseServings: 8, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Varkensschouder", amount: 3, unit: "kg" },
                { id: "i2", name: "Mosterd (als binder)", amount: 2, unit: "tbsp" },
                { id: "i3", name: "BBQ rub", amount: 4, unit: "tbsp" },
                { id: "i4", name: "Appelsap (spritz)", amount: 250, unit: "ml" },
                { id: "i5", name: "BBQ saus", amount: 200, unit: "ml" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Vul met kamado-briketten tot net onder het vuurschaal-rooster",
                "Voeg 2-3 stukken appel- of kersenhout toe",
                "Stabiliseer de dome op 110°C voor je het vlees plaatst"
            ],
            phases: [
                ["Roken", "110°C tot kern 65°C"],
                ["Wrap", "Inpakken tot kern 92°C"],
                ["Rust", "Min. 30 min laten rusten"]
            ]
        },

        {
            id: "ribs", name: "Spare Ribs 3-2-1", category: "Varken",
            meat: "Spare ribs", dome: 107, target: 88, duration: "6 uur",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Spare ribs", amount: 2, unit: "kg" },
                { id: "i2", name: "BBQ rub", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Appelsap (spritz)", amount: 200, unit: "ml" },
                { id: "i4", name: "Honing", amount: 2, unit: "tbsp" },
                { id: "i5", name: "BBQ saus", amount: 150, unit: "ml" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Vlies aan de achterzijde van het rek verwijderen",
                "Kersen- of eikenhout toevoegen voor rook",
                "Dome stabiliseren op 107°C"
            ],
            phases: [
                ["Roken", "3 uur onverpakt"],
                ["Inpakken", "2 uur in folie met vocht"],
                ["Afwerken", "1 uur onverpakt met saus"]
            ]
        },

        {
            id: "baby_back_ribs", name: "Baby Back Ribs", category: "Varken",
            meat: "Baby back ribs", dome: 110, target: 90, duration: "5 uur",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Baby back ribs", amount: 1.5, unit: "kg" },
                { id: "i2", name: "BBQ rub", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Appelazijn (spritz)", amount: 150, unit: "ml" },
                { id: "i4", name: "BBQ saus", amount: 150, unit: "ml" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Vlies verwijderen en droogdeppen",
                "Appelhout toevoegen voor milde rook",
                "Dome stabiliseren op 110°C"
            ],
            phases: [
                ["Roken", "3 uur onverpakt"],
                ["Inpakken", "1,5 uur in folie"],
                ["Afwerken", "30 min met saus glaceren"]
            ]
        },

        {
            id: "brisket", name: "Beef Brisket", category: "Rund",
            meat: "Runderborst", dome: 110, target: 96, duration: "14 uur",
            baseServings: 10, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Runderborst (briket)", amount: 5, unit: "kg" },
                { id: "i2", name: "Grof zeezout", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Grof gemalen peper", amount: 3, unit: "tbsp" },
                { id: "i4", name: "Slagersgaas / injectievocht", amount: 100, unit: "ml" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten en drippan",
                "Vetlaag bijsnijden tot ca. 0,5 cm",
                "Eikenhout toevoegen voor stevige rooksmaak",
                "Dome stabiliseren op 110°C, plaats vetkant boven"
            ],
            phases: [
                ["Roken", "110°C tot kern 70°C (the stall)"],
                ["Wrap", "Inpakken in slagerspapier tot kern 96°C"],
                ["Rust", "Min. 1 uur laten rusten in handdoek/koelbox"]
            ]
        },

        {
            id: "beer_can_chicken", name: "Beer Can Chicken", category: "Gevogelte",
            meat: "Hele kip", dome: 180, target: 82, duration: "1,5 uur",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Hele kip", amount: 1.6, unit: "kg" },
                { id: "i2", name: "Kipkruiden rub", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Bier (blikje)", amount: 330, unit: "ml" },
                { id: "i4", name: "Olijfolie", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Bierblik voor 1/3 legen en kip erop plaatsen",
                "Kersenhout toevoegen voor lichte rook",
                "Dome stabiliseren op 180°C"
            ],
            phases: [
                ["Roken", "180°C tot kern 65°C"],
                ["Afwerken", "Tot kern 82°C in de dijen"],
                ["Rust", "10 min laten rusten"]
            ]
        },

        {
            id: "spatchcock_chicken", name: "Spatchcock Kip", category: "Gevogelte",
            meat: "Hele kip (gevlinderd)", dome: 200, target: 75, duration: "1 uur",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Hele kip", amount: 1.8, unit: "kg" },
                { id: "i2", name: "Boter (gesmolten)", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Kipkruiden rub", amount: 3, unit: "tbsp" },
                { id: "i4", name: "Citroen", amount: 1, unit: null }
            ],
            setup: [
                "Ruggengraat verwijderen en kip plat drukken",
                "Indirecte opstelling, huid richting vuur",
                "Appelhout toevoegen voor rook",
                "Dome stabiliseren op 200°C"
            ],
            phases: [
                ["Grillen", "200°C indirect tot kern 65°C"],
                ["Afwerken", "Huid krokant tot kern 75°C"],
                ["Rust", "10 min laten rusten"]
            ]
        },

        {
            id: "burnt_ends", name: "Pork Belly Burnt Ends", category: "Varken",
            meat: "Buikspek", dome: 120, target: 93, duration: "5 uur",
            baseServings: 6, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Buikspek (zonder zwoerd)", amount: 2, unit: "kg" },
                { id: "i2", name: "BBQ rub", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Honing", amount: 3, unit: "tbsp" },
                { id: "i4", name: "BBQ saus", amount: 200, unit: "ml" },
                { id: "i5", name: "Boter", amount: 50, unit: "g" }
            ],
            setup: [
                "Buikspek in blokjes van 3 cm snijden",
                "Indirecte opstelling met deflectorplaten",
                "Kersenhout toevoegen voor rook",
                "Dome stabiliseren op 120°C"
            ],
            phases: [
                ["Roken", "120°C tot kern 75°C"],
                ["Braiseren", "In pan met boter/honing tot 93°C"],
                ["Glaceren", "15 min met saus laten inkoken"]
            ]
        },

        {
            id: "short_ribs", name: "Beef Short Ribs", category: "Rund",
            meat: "Runder short ribs", dome: 120, target: 95, duration: "7 uur",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Short ribs", amount: 2, unit: "kg" },
                { id: "i2", name: "Grof zeezout", amount: 2, unit: "tbsp" },
                { id: "i3", name: "Grof gemalen peper", amount: 2, unit: "tbsp" },
                { id: "i4", name: "Rundvleesbouillon (spritz)", amount: 200, unit: "ml" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten en drippan",
                "Vliesje aan onderzijde verwijderen",
                "Eikenhout toevoegen voor stevige rooksmaak",
                "Dome stabiliseren op 120°C"
            ],
            phases: [
                ["Roken", "120°C tot kern 70°C"],
                ["Wrap", "Inpakken tot kern 95°C"],
                ["Rust", "20 min laten rusten"]
            ]
        },

        {
            id: "tri_tip", name: "Tri-Tip", category: "Rund",
            meat: "Tri-tip steak", dome: 120, target: 54, duration: "1,5 uur",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Tri-tip", amount: 1, unit: "kg" },
                { id: "i2", name: "Grof zeezout", amount: 1, unit: "tbsp" },
                { id: "i3", name: "Knoflookpoeder", amount: 1, unit: "tbsp" },
                { id: "i4", name: "Grof gemalen peper", amount: 1, unit: "tbsp" }
            ],
            setup: [
                "Reverse sear: eerst indirect, daarna direct schroeien",
                "Deflectorplaten plaatsen voor de rookfase",
                "Eikenhout toevoegen",
                "Dome stabiliseren op 120°C"
            ],
            phases: [
                ["Roken", "120°C indirect tot kern 48°C"],
                ["Schroeien", "260°C direct, 1-2 min per kant"],
                ["Rust", "10 min laten rusten"]
            ]
        },

        {
            id: "prime_rib", name: "Prime Rib", category: "Rund",
            meat: "Ribeye rollade", dome: 130, target: 54, duration: "3 uur",
            baseServings: 6, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Ribeye rollade (bot-in)", amount: 2.5, unit: "kg" },
                { id: "i2", name: "Grof zeezout", amount: 2, unit: "tbsp" },
                { id: "i3", name: "Verse rozemarijn", amount: 2, unit: "tbsp" },
                { id: "i4", name: "Boter (gesmolten)", amount: 50, unit: "g" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Vlees op kamertemperatuur laten komen",
                "Eikenhout toevoegen voor milde rook",
                "Dome stabiliseren op 130°C"
            ],
            phases: [
                ["Roken", "130°C tot kern 48°C"],
                ["Schroeien", "260°C direct voor korstje"],
                ["Rust", "15 min laten rusten"]
            ]
        },

        {
            id: "leg_of_lamb", name: "Lamsbout", category: "Lam",
            meat: "Lamsbout", dome: 150, target: 60, duration: "3 uur",
            baseServings: 6, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Lamsbout (been eruit)", amount: 2, unit: "kg" },
                { id: "i2", name: "Knoflook (tenen)", amount: 4, unit: null },
                { id: "i3", name: "Rozemarijn", amount: 3, unit: "tbsp" },
                { id: "i4", name: "Olijfolie", amount: 3, unit: "tbsp" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Vlees insnijden en marineren met knoflook/olie",
                "Eikenhout toevoegen",
                "Dome stabiliseren op 150°C"
            ],
            phases: [
                ["Grillen", "150°C indirect tot kern 55°C"],
                ["Schroeien", "Kort direct voor korstje"],
                ["Rust", "15 min laten rusten"]
            ]
        },

        {
            id: "lamb_shoulder", name: "Lamsschouder", category: "Lam",
            meat: "Lamsschouder", dome: 120, target: 92, duration: "6 uur",
            baseServings: 6, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Lamsschouder", amount: 1.8, unit: "kg" },
                { id: "i2", name: "Komijn (gemalen)", amount: 1, unit: "tbsp" },
                { id: "i3", name: "Paprikapoeder", amount: 1, unit: "tbsp" },
                { id: "i4", name: "Olijfolie", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Vlees insmeren met kruidenmix",
                "Kersenhout toevoegen",
                "Dome stabiliseren op 120°C"
            ],
            phases: [
                ["Roken", "120°C tot kern 70°C"],
                ["Wrap", "Inpakken tot kern 92°C"],
                ["Rust", "20 min laten rusten, dan pulled"]
            ]
        },

        {
            id: "smoked_turkey", name: "Gerookte Kalkoen", category: "Gevogelte",
            meat: "Hele kalkoen", dome: 150, target: 74, duration: "4 uur",
            baseServings: 10, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Hele kalkoen", amount: 5, unit: "kg" },
                { id: "i2", name: "Pekel (zout)", amount: 200, unit: "g" },
                { id: "i3", name: "Boter (gesmolten)", amount: 100, unit: "g" },
                { id: "i4", name: "Gevogeltekruiden", amount: 3, unit: "tbsp" }
            ],
            setup: [
                "Kalkoen 12 uur van tevoren pekelen",
                "Indirecte opstelling met deflectorplaten en drippan",
                "Appelhout toevoegen voor rook",
                "Dome stabiliseren op 150°C"
            ],
            phases: [
                ["Roken", "150°C tot kern 60°C"],
                ["Afwerken", "Tot kern 74°C in de borst"],
                ["Rust", "20 min laten rusten"]
            ]
        },

        {
            id: "turkey_breast", name: "Kalkoenfilet", category: "Gevogelte",
            meat: "Kalkoenfilet", dome: 150, target: 70, duration: "1,5 uur",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Kalkoenfilet", amount: 1.2, unit: "kg" },
                { id: "i2", name: "Boter (gesmolten)", amount: 2, unit: "tbsp" },
                { id: "i3", name: "Gevogeltekruiden", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Filet insmeren met boter en kruiden",
                "Appelhout toevoegen",
                "Dome stabiliseren op 150°C"
            ],
            phases: [
                ["Roken", "150°C tot kern 65°C"],
                ["Afwerken", "Tot kern 70°C"],
                ["Rust", "10 min laten rusten"]
            ]
        },

        {
            id: "pork_loin", name: "Varkenshaas", category: "Varken",
            meat: "Varkenshaas", dome: 150, target: 63, duration: "1,5 uur",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Varkenshaas", amount: 1.2, unit: "kg" },
                { id: "i2", name: "Mosterd (als binder)", amount: 1, unit: "tbsp" },
                { id: "i3", name: "BBQ rub", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Vlees insmeren met mosterd en rub",
                "Appelhout toevoegen",
                "Dome stabiliseren op 150°C"
            ],
            phases: [
                ["Roken", "150°C tot kern 55°C"],
                ["Schroeien", "Kort direct voor korstje"],
                ["Rust", "10 min laten rusten"]
            ]
        },

        {
            id: "cedar_salmon", name: "Cederhout Zalm", category: "Vis",
            meat: "Zalmfilet", dome: 120, target: 52, duration: "45 minuten",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Zalmfilet (met huid)", amount: 800, unit: "g" },
                { id: "i2", name: "Bruine suiker", amount: 2, unit: "tbsp" },
                { id: "i3", name: "Grof zeezout", amount: 1, unit: "tbsp" },
                { id: "i4", name: "Dille", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Cederhouten plank min. 1 uur laten weken",
                "Indirecte opstelling met deflectorplaten",
                "Zalm op de plank leggen, geen extra rookhout nodig",
                "Dome stabiliseren op 120°C"
            ],
            phases: [
                ["Roken", "120°C tot kern 48°C"],
                ["Afwerken", "Tot kern 52°C, vlees glazig"]
            ]
        },

        {
            id: "whole_trout", name: "Hele Forel", category: "Vis",
            meat: "Forel", dome: 130, target: 60, duration: "40 minuten",
            baseServings: 2, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Hele forel (schoongemaakt)", amount: 500, unit: "g" },
                { id: "i2", name: "Citroen", amount: 1, unit: null },
                { id: "i3", name: "Verse dille", amount: 2, unit: "tbsp" },
                { id: "i4", name: "Olijfolie", amount: 1, unit: "tbsp" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Vis vullen met citroen en dille",
                "Elzenhout toevoegen voor rook",
                "Dome stabiliseren op 130°C"
            ],
            phases: [
                ["Roken", "130°C tot kern 60°C"],
                ["Serveren", "Direct opdienen"]
            ]
        },

        {
            id: "pizza", name: "Kamado Pizza", category: "Overig",
            meat: "Pizza", dome: 300, target: null, duration: "10 minuten",
            baseServings: 2, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Pizzabloem (00)", amount: 250, unit: "g" },
                { id: "i2", name: "Water", amount: 150, unit: "ml" },
                { id: "i3", name: "Gist", amount: 1, unit: "tsp" },
                { id: "i4", name: "Tomatensaus", amount: 100, unit: "ml" },
                { id: "i5", name: "Mozzarella", amount: 150, unit: "g" }
            ],
            setup: [
                "Pizzasteen minimaal 30 min mee laten opwarmen",
                "Directe opstelling zonder deflector",
                "Dome opstoken naar 300°C",
                "Pizzaschep bebloemen tegen aanplakken"
            ],
            phases: [
                ["Opwarmen", "Steen op 300°C brengen"],
                ["Bakken", "8-10 min tot korst goudbruin"]
            ]
        },

        {
            id: "mac_and_cheese", name: "Gerookte Mac and Cheese", category: "Overig",
            meat: "Bijgerecht", dome: 150, target: null, duration: "1 uur",
            baseServings: 6, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Macaroni", amount: 500, unit: "g" },
                { id: "i2", name: "Cheddar (geraspt)", amount: 300, unit: "g" },
                { id: "i3", name: "Room", amount: 300, unit: "ml" },
                { id: "i4", name: "Boter", amount: 50, unit: "g" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Macaroni voorkoken en mengen met saus in gietijzeren pan",
                "Kersenhout toevoegen voor lichte rook",
                "Dome stabiliseren op 150°C"
            ],
            phases: [
                ["Roken", "150°C, 45 min tot bubbelend"],
                ["Afwerken", "15 min extra voor korstje"]
            ]
        },

        {
            id: "dutch_oven_chili", name: "Dutch Oven Chili", category: "Overig",
            meat: "Rundergehakt", dome: 150, target: null, duration: "2,5 uur",
            baseServings: 6, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Rundergehakt", amount: 1, unit: "kg" },
                { id: "i2", name: "Kidneybonen (blik)", amount: 400, unit: "g" },
                { id: "i3", name: "Gepelde tomaten (blik)", amount: 800, unit: "g" },
                { id: "i4", name: "Ui", amount: 2, unit: null },
                { id: "i5", name: "Chilipoeder", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Gehakt direct aanbraden in de dutch oven op de kamado",
                "Eikenhout toevoegen voor rooksmaak",
                "Dome stabiliseren op 150°C"
            ],
            phases: [
                ["Aanbraden", "Gehakt en ui op smaak brengen"],
                ["Sudderen", "2 uur met deksel op de kamado"]
            ]
        },

        {
            id: "smoked_wings", name: "Gerookte Chicken Wings", category: "Gevogelte",
            meat: "Kippenvleugels", dome: 130, target: 74, duration: "1,5 uur",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Kippenvleugels", amount: 1.2, unit: "kg" },
                { id: "i2", name: "BBQ rub", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Bakpoeder (voor krokante huid)", amount: 1, unit: "tsp" },
                { id: "i4", name: "BBQ saus", amount: 100, unit: "ml" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Vleugels droogdeppen en met bakpoeder/rub bestuiven",
                "Appelhout toevoegen",
                "Dome stabiliseren op 130°C"
            ],
            phases: [
                ["Roken", "130°C tot kern 70°C"],
                ["Krokant maken", "180°C direct tot kern 74°C"]
            ]
        },

        {
            id: "kielbasa", name: "Gerookte Worst", category: "Varken",
            meat: "Kielbasa", dome: 110, target: 70, duration: "2 uur",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Verse worst (kielbasa)", amount: 800, unit: "g" },
                { id: "i2", name: "Mosterd (om te serveren)", amount: 2, unit: "tbsp" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten",
                "Worst op kamerroostertemperatuur laten komen",
                "Eikenhout toevoegen voor stevige rook",
                "Dome stabiliseren op 110°C"
            ],
            phases: [
                ["Roken", "110°C tot kern 70°C"],
                ["Serveren", "Direct opdienen"]
            ]
        },

        {
            id: "grilled_vegetables", name: "Gegrilde Groenteschotel", category: "Vegetarisch",
            meat: "Groenten", dome: 200, target: null, duration: "25 minuten",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Gemengde groenten (courgette, paprika, ui)", amount: 800, unit: "g" },
                { id: "i2", name: "Olijfolie", amount: 3, unit: "tbsp" },
                { id: "i3", name: "Knoflook (tenen)", amount: 2, unit: null },
                { id: "i4", name: "Zeezout", amount: 1, unit: "tsp" }
            ],
            setup: [
                "Directe opstelling op de grillplaat of in grillmand",
                "Groenten in gelijke stukken snijden",
                "Geen extra rookhout nodig",
                "Dome stabiliseren op 200°C"
            ],
            phases: [
                ["Grillen", "200°C direct, regelmatig omscheppen"],
                ["Serveren", "Direct opdienen"]
            ]
        },

        {
            id: "smoked_cheese", name: "Gerookte Kaas", category: "Vegetarisch",
            meat: "Kaas", dome: 25, target: null, duration: "2 uur",
            baseServings: 4, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Kaas (bv. jong belegen)", amount: 500, unit: "g" }
            ],
            setup: [
                "Cold smoke generator gebruiken i.p.v. gewone kolen",
                "Kaas op een rooster boven een lekbak leggen",
                "Appelhout(snippers) gebruiken voor milde rook",
                "Dome zo laag mogelijk houden (max. 25°C) zodat kaas niet smelt"
            ],
            phases: [
                ["Koud roken", "2 uur bij max. 25°C"],
                ["Rust", "Minimaal 24 uur laten rijpen in de koelkast"]
            ]
        },

        {
            id: "reverse_sear_ribeye", name: "Reverse Sear Ribeye", category: "Rund",
            meat: "Ribeye steak", dome: 120, target: 54, duration: "1 uur",
            baseServings: 2, primaryIngredientId: "i1",
            ingredients: [
                { id: "i1", name: "Ribeye steak (dik)", amount: 800, unit: "g" },
                { id: "i2", name: "Grof zeezout", amount: 1, unit: "tbsp" },
                { id: "i3", name: "Grof gemalen peper", amount: 1, unit: "tbsp" },
                { id: "i4", name: "Boter", amount: 30, unit: "g" }
            ],
            setup: [
                "Indirecte opstelling met deflectorplaten voor de rookfase",
                "Deflector verwijderen voor de directe schroeifase",
                "Eikenhout toevoegen",
                "Dome stabiliseren op 120°C"
            ],
            phases: [
                ["Roken", "120°C indirect tot kern 48°C"],
                ["Schroeien", "260°C direct, 45-60 sec per kant"],
                ["Rust", "5 min laten rusten"]
            ]
        }

    ];
