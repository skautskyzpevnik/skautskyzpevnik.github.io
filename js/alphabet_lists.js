async function render(){
    const url = new URL(window.location.href);
    const char = url.searchParams.get('char');
    if(char == undefined){
        window.location.href = "seznamy.html"
    }
    document.getElementById("char").innerText = char;

    let list = await fetch("data/"+ char +".json");
    list = await list.json();
    for(song in list){
        let button = document.createElement("button");
        button.setAttribute("class", "button");
        button.setAttribute("data-link", list[song].file);
        button.innerText = song;

        button.addEventListener("click", function(event){
            let link = event.target.getAttribute("data-link");
            window.open('render.html?songname=' + link, '_blank')
        });

        document.getElementById("songHolder").appendChild(button);
    }
}
render();