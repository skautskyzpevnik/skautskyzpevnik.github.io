function insertBg(){
    if(!settings.bgimage){
        return;
    }
    if(typeof NetworkInformation != 'undefined'){
        if(NetworkInformation.saveData){
            return
        }
    }

    let filename = extractFilenameFromURL(window.location.href);

    document.body.style.backgroundImage = 'url("img/' + filename +'.jpg")';
}
eventmanager.addEventListener(["settingsloaded", "utilsloaded"], insertBg);