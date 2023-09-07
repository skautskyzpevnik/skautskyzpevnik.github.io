eventmanager.addEventListener(["titlePageCreatorloaded", "songsloaded"], function() {
    songList.songBooks.forEach(function(songBook){
        document.getElementById("songbook-holder").appendChild(titlePageCreator(songBook.title, songBook.subtitle, function(event){
        let url = getParentByClass(event.target, "titlepageholder").getAttribute("data-url");
        location.href = url; 
    },"render.html?songbook=" + songBook.file));
    });
    // document.getElementById("addsongbook").addEventListener("click", function() {
    //     let title = prompt("Zadejte název zpěvníku");
    //     let subtitle = prompt("Zadejte podnázev zpěvníku");
    //     songList.addSongbook(title, subtitle);
    // });
});