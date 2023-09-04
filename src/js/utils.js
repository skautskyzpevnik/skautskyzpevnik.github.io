function extractFilenameFromURL(url){
    let filename = url.split("/");
    filename = filename[filename.length-1].split("#")[0].split("?")[0];
    filename = filename.split('.').slice(0, -1).join('.');
    if(filename == ""){
        filename = "index";
    }
    return filename;
}
eventmanager.fireevent("utilsloaded");