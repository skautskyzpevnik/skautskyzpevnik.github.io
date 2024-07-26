import { songList } from "./search.js";
import { getParentByClass } from "./utils.js";
import { downloadManagerInstance } from "./downloadManager/index.js"

/**
 * Creates ui representing song
 * @param {Object} song 
 * @returns {HTMLElement}
 */
function createSongDiv(song){
    const div = document.createElement("div");
    div.setAttribute("data-songfile", song.file);
    div.setAttribute("class", "songholder");
    div.addEventListener("click", function(event){
        if(event.target.nodeName !== "INPUT"){
            let url = "render.html?songname=" + getParentByClass(event.target, "songholder").getAttribute("data-songfile");
            window.location.href=(url)
        }    
    });

    const songname = document.createElement("p");
    songname.innerText = song.title + " - " + song.artist;
    div.appendChild(songname);
    
    const filler = document.createElement("div");
    filler.setAttribute("class", "song-filler");
    div.appendChild(filler);

    const label = document.createElement("label");
    label.setAttribute("for", song.file + "offline");
    label.innerText = "offline:";
    div.appendChild(label);

    const offlineCheckbox = document.createElement("input");
    offlineCheckbox.setAttribute("type", "checkbox");
    offlineCheckbox.setAttribute("id", song.file + "offline");
    offlineCheckbox.checked = song.offline;
    offlineCheckbox.addEventListener("click", async function(event){
        let url = getParentByClass(event.target, "songholder").getAttribute("data-songfile");
        if(event.target.checked){
            downloadManagerInstance.downloadToCache(["../../data/" + url + ".chordpro"], "songCache")
        }else{
            let cache = await caches.open("songCache");
            console.log("data/" + url);
            await cache.delete("data/" + url + ".chordpro");
        }
    });
    div.appendChild(offlineCheckbox);

    return div;
}

/**
 * Get and render all song matching filters.
 */
async function renderSongs() {
    let titleString = document.getElementById("songname").value;
    let offlineString = document.getElementById("offline").checked;
    if(!offlineString){
        offlineString = undefined;
    }
    let interpret = document.getElementById("artist").value;

    const result = await songList.search(titleString, interpret, offlineString);
    document.getElementById("resultHolder").innerHTML = "";

    result.forEach(song => {
        document.getElementById("resultHolder").appendChild(createSongDiv(song));
    });
}

/** Downloads all song for offline use */
async function downloadAllSongs(){
    const result = await songList.search(undefined, undefined, false);
    let songlist = [];
    result.forEach(song => {
        songlist.push(["../../data/" + song.file + ".chordpro"]);
    });
    downloadManagerInstance.downloadToCache(songlist, "songCache", undefined, console.log ,renderSongs);
}

document.getElementById("songname").value = "";
document.getElementById("artist").value = "";

renderSongs();
document.getElementById("songname").addEventListener("keyup", function(event){
    renderSongs();
});
document.getElementById("offline").addEventListener("click", function(event){
    renderSongs();
});
document.getElementById("artist").addEventListener("keyup", function(event){
    renderSongs();
});
document.getElementById("downloadAll").addEventListener("click", downloadAllSongs);