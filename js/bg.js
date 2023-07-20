function insertBg(){
    if(!settings.bgimage){
        return;
    }
    if(typeof NetworkInformation != 'undefined'){
        if(NetworkInformation.saveData){
            return
        }
    }

    let filename = window.location.href.split("/");
    filename = filename[filename.length-1].split("#")[0].split("?")[0];
    filename = filename.split('.').slice(0, -1).join('.');
    document.body.style.backgroundImage = 'url("img/' + filename +'.jpg")';
}
eventmanager.addEventListener("settingsloaded", insertBg);