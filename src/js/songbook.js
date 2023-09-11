import { titlePageCreator } from "./titlepagecreator.js";
import { songList } from "./search.js";
import { getParentByClass } from "./utils.js";

async function loadSongBooks(){
    let sb = await songList.songBooks()
    sb.forEach(function(songBook){
        document.getElementById("songbook-holder").appendChild(titlePageCreator(songBook.title, songBook.subtitle, function(event){
            let url = getParentByClass(event.target, "titlepageholder").getAttribute("data-url");
            location.href = url; 
        },"render.html?songbook=" + songBook.file));
    });
}
loadSongBooks()
// document.getElementById("addsongbook").addEventListener("click", function() {
//     let title = prompt("Zadejte název zpěvníku");
//     let subtitle = prompt("Zadejte podnázev zpěvníku");
//     songList.addSongbook(title, subtitle);
// });