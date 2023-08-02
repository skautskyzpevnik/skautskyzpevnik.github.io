/**
 * Searches array.title for strings starting with string
 * @param {string} string SearchString
 * @param {Object} array array to search in
 * @returns {Array} Array of results
 */
function search(string, array){
    const results = [];
    for(let song in array){
        let isSame = true;
        song = array[song];
        for(i=0; i < string.length; i++){
            if(string.charAt(i).toLowerCase() != song.title.charAt(i).toLowerCase()){
                isSame = false;
                break;
            }
        }
        if(isSame){
            results.push(song);
        }
    }
    return results;
}

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

async function render(searchString) {
    let list = await fetch("data/list.json");
    list = await list.json();
    const result = search(searchString, list)
    document.getElementById("resultHolder").innerHTML = "";

    result.forEach(song => {
        document.getElementById("resultHolder").appendChild(addButton("render.html?songname=" + song.file, song.title + " - " + song.artist));
    });
}

document.getElementById("search").value = "";

document.getElementById("search").addEventListener("keyup", function(event){
    const searchString = event.target.value;
    if(searchString.length == 0){
        document.getElementById("resultHolder").innerHTML = "";
    }else{
        render(searchString);
    }
});

