//settings settings
const settings_preset ={
    "bgimage": true,
}

function save_settings(){
    localStorage.setItem("settings" , JSON.stringify(settings));    
}
function reset_settings(){
    localStorage.setItem("settings" , JSON.stringify(settings_preset));
}

if(!localStorage.getItem("settings")){
    //no settings defined yet
    reset_settings();
}

const settings =  JSON.parse(localStorage.getItem("settings"));
eventmanager.fireevent("settingsloaded");
//there should be some updating mechanism