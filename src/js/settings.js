//settings settings
const settings_preset ={
    "bgimage": true,
}

export function save_settings(){
    localStorage.setItem("settings" , JSON.stringify(settings));    
}
export function reset_settings(){
    localStorage.setItem("settings" , JSON.stringify(settings_preset));
}

if(!localStorage.getItem("settings")){
    //no settings defined yet
    reset_settings();
}

export const settings =  JSON.parse(localStorage.getItem("settings"));