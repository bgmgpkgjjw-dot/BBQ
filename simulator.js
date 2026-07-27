/* ==========================================================
   Hermanos Grill Companion
   simulator.js

   Simuleert Bluetooth thermometer data
   Werkt voor alle actieve sondes (tot 6), niet alleen dome/vlees
   ========================================================== */


function startSimulator(){

    let isScrolling = false;
    let scrollTimer = null;

    const content = () => document.querySelector('.content');

    const handleScroll = () => {
        isScrolling = true;
        if(scrollTimer){
            clearTimeout(scrollTimer);
        }

        scrollTimer = setTimeout(() => {
            isScrolling = false;
        }, 150);
    };

    const contentEl = content();
    if(contentEl){
        contentEl.addEventListener('scroll', handleScroll, { passive: true });
    }

    setInterval(()=>{

        if(isScrolling) return;

        updateTemperatures();

        updateBattery();

        updateLiveUi();


    },2000);


}





function updateTemperatures(){


    const domeProbe = appState.probes.find(

        p => p.active && p.type === "dome"

    );



    appState.probes

    .filter(p => p.active && p.type !== "unused")

    .forEach(probe => {


        if(probe.temperature === null){

            probe.temperature = defaultStartTemperature(probe.type);

        }


        if(probe.type === "dome"){

            updateDomeProbe(probe);

        }


        if(probe.type === "meat"){

            updateMeatProbe(probe);

        }


        if(probe.type === "ambient"){

            updateAmbientProbe(probe, domeProbe);

        }


    });


}




/*
    Dome temperatuur beweegt naar cook target,
    of drift rustig richting kamertemperatuur als er geen cook loopt
*/
function updateDomeProbe(probe){


    const target =
    appState.cook.active

    ?

    appState.cook.domeTarget

    :

    20;



    if(probe.temperature < target){

        probe.temperature += random(1,4);

    }


    if(probe.temperature > target){

        probe.temperature -= random(1,3);

    }

}




/*
    Vleestemperatuur stijgt langzaam richting target
    zolang er een actieve cook met een kerntarget is
*/
function updateMeatProbe(probe){


    if(!appState.cook.active) return;


    const target = appState.cook.meatTarget;


    if(target && probe.temperature < target){

        probe.temperature += 0.2;

    }

}




/*
    Ambient sonde volgt losjes de dome temperatuur
    (bv. gemeten op grillhoogte i.p.v. in de dome zelf)
*/
function updateAmbientProbe(probe, domeProbe){


    if(!appState.cook.active || !domeProbe) return;


    const target = domeProbe.temperature - 10;


    if(probe.temperature < target){

        probe.temperature += random(1,3);

    }


    if(probe.temperature > target){

        probe.temperature -= random(1,2);

    }

}






function updateBattery(){


    if(
        appState.bluetooth.battery > 0
    ){

        appState.bluetooth.battery -= 0.01;

    }


}






function random(min,max){


    return Math.random() *
    (max-min)+min;


}






// starten zodra bestand geladen is

startSimulator();
