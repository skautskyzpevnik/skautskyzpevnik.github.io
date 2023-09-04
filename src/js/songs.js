/**
 * returns button with specified text pointing to specified url
 * @param {string} url url to redirect after click
 * @param {string} text text of button
 */
function addButton(url, text){
    const button = document.createElement("button");
    button.setAttribute("class", "button button2");
    button.setAttribute("data-url",url);
    button.innerText = text;

    button.addEventListener("click", function(event){
        let url = event.target.getAttribute("data-url");
        window.location.href=(url)
    });
    return button;
}

/**
 * Get and render all song matching filters.
 */
async function render() {
    let titleString = document.getElementById("songname").value;
    let offlineString = document.getElementById("offline").checked;
    if(!offlineString){
        offlineString = undefined;
    }
    let interpret = document.getElementById("artist").value;

    const result = await songList.search(titleString, interpret, offlineString);
    document.getElementById("resultHolder").innerHTML = "";

    result.forEach(song => {
        document.getElementById("resultHolder").appendChild(addButton("render.html?songname=" + song.file, song.title + " - " + song.artist));
    });
}

document.getElementById("songname").value = "";

eventmanager.addEventListener(["utilsloaded", "songsloaded"], function(){
    render("");
    document.getElementById("songname").addEventListener("keyup", function(event){
        render();
    });
    document.getElementById("offline").addEventListener("click", function(event){
        render();
    });
    document.getElementById("artist").addEventListener("keyup", function(event){
        render();
    });
});