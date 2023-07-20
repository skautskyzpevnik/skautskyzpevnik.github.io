async function render(){
    let list = await fetch("data/list.json");
    list = await list.json();
    list.forEach(element => {
        let button = document.createElement("button");
        button.setAttribute("class", "button button2");
        button.setAttribute("data-char", element);
        button.innerText = element;

        button.addEventListener("click", function(event){
            let char = event.target.getAttribute("data-char");
            window.location.href=('alphabet_lists.html?char=' + char)
        });

        document.getElementById("alphabetHolder").appendChild(button);
    });
}
render();