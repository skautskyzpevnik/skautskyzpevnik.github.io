import {extractFilenameFromURL} from "./utils.js"
import { settings } from "./settings.js"
/**
 * Adds background image
 */
function addBg(){
    let filename = extractFilenameFromURL(window.location.href);
    document.body.style.backgroundImage = 'url("img/' + filename +'.jpg")';
}

if(settings.bgimage){
    if(typeof NetworkInformation != 'undefined'){
        if(!NetworkInformation.saveData){
            addBg();
        }
    }else{
        addBg();
    }
}


