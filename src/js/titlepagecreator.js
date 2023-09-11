export function titlePageCreator(title, subtitle, onclick=function(){}, url=undefined){
    const titlePageHolder = document.createElement("div");
    titlePageHolder.setAttribute("class", "titlepageholder");
    titlePageHolder.setAttribute("data-url", url);
    titlePageHolder.addEventListener("click", onclick);

    const logo = document.createElement("img");
    logo.setAttribute("src", "img/favicon.svg");
    logo.setAttribute("class", "logo");
    titlePageHolder.appendChild(logo);

    const h2 = document.createElement("h2");
    h2.innerText = subtitle;
    titlePageHolder.appendChild(h2);

    const h1 = document.createElement("h1");
    h1.innerText = title;
    titlePageHolder.appendChild(h1);

    const skautLogo = document.createElement("img");
    skautLogo.setAttribute("src", "img/skautlogo.svg");
    skautLogo.setAttribute("class", "skautlogo");
    titlePageHolder.appendChild(skautLogo);

    return titlePageHolder;
}