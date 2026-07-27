const appState = {

    screen:"dashboard",

    selectedRecipe:null,

    recipeScale:1,


    bluetooth:{

        connected:false,

        device:null,

        deviceRef:null,

        battery:null,

        status:"Not connected",

        error:"",

        serviceUuid:"0000ffb0-0000-1000-8000-00805f9b34fb",

        characteristicUuid:"0000ffb2-0000-1000-8000-00805f9b34fb",

        lastPayload:"",

        lastUpdatedAt:null

    },


    theme:{

        brand:"Hermanos",

        accent:"#C1272D"

    },


    cook:{

        active:false,

        name:"",

        startedAt:null,

        domeTarget:110,

        meatTarget:92,

        duration:"",

        phase:0,

        phases:[]

    },


    probes:[

        {
            id:1,
            name:"Dome",
            type:"dome",
            temperature:null,
            previousTemperature:null,
            calibration:0,
            active:true,
            icon:"🔥",
            lastUpdate:null
        },

        {
            id:2,
            name:"Vlees",
            type:"meat",
            temperature:null,
            previousTemperature:null,
            calibration:0,
            active:true,
            icon:"🥩",
            lastUpdate:null
        },

        {
            id:3,
            name:"Probe 3",
            type:"unused",
            temperature:null,
            previousTemperature:null,
            calibration:0,
            active:false,
            icon:"🌡️",
            lastUpdate:null
        },

        {
            id:4,
            name:"Probe 4",
            type:"unused",
            temperature:null,
            previousTemperature:null,
            calibration:0,
            active:false,
            icon:"🌡️",
            lastUpdate:null
        },

        {
            id:5,
            name:"Probe 5",
            type:"unused",
            temperature:null,
            previousTemperature:null,
            calibration:0,
            active:false,
            icon:"🌡️",
            lastUpdate:null
        },

        {
            id:6,
            name:"Probe 6",
            type:"unused",
            temperature:null,
            previousTemperature:null,
            calibration:0,
            active:false,
            icon:"🌡️",
            lastUpdate:null
        }

    ],


    history:{

        enabled:true,

        maxPoints:120,

        data:{

            1:[],
            2:[],
            3:[],
            4:[],
            5:[],
            6:[]

        }

    },


    alerts:{

        enabled:true,

        meatTemperature:65,

        domeDeviation:8,

        history:[]

    },


    settings:{

        notifications:true,

        temperatureUnit:"C",

        firstRun:false,

        compactProbeCards:true,

        showHistory:true,

        animations:true

    }

};




function updateState(callback){

    callback(appState);


    if(typeof render==="function"){

        render();

    }

}