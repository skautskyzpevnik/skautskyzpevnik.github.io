import { SyntaxTreeNodeWithChildren } from "../abstractNodes/nodeWithChildren.js";

/**
 * Class implementing song ast node
*/
export class Song extends SyntaxTreeNodeWithChildren {
    title = "";
    artist = "";
    /**@type {string|undefined} */
    filename = undefined;
    /**@type {Soc[]|undefined} */
    chorusIndex = {}
    /**@type {Soc|undefined} */
    lastChorus = undefined;
    get html() {
        let element = document.createElement("div");
        element.setAttribute("class", "songholder");
        element.setAttribute("data-title", this.title);
        element.setAttribute("data-artist", this.artist);

        let heading = document.createElement("h1");
        heading.innerText = this.title + " - " + this.artist;
        element.appendChild(heading);

        for (let child of this.children) {
            element.appendChild(child.html);
        }

        return element;
    }

    get chordpro() {
        let text = "\n{ns}" + "\n";
        if (this.title !== "") {
            text += "{title: " + this.title + "}\n"
        }
        if (this.artist !== "") {
            text += "{artist: " + this.artist + "}\n"
        }
        for (let child of this.children) {
            text += child.chordpro;
        }
        return text;
    }

    get tex() {
        let text = "\n";
        if (this.title !== "" && this.artist !== "") {
            text += `\\section{${this.title} - ${this.artist}}\n`
        } else if (this.title !== "") {
            text += `\\section{${this.title}}\n`
        } else if (this.artist !== "") {
            text += `\\section{${this.artist}}\n`
        }

        text += "\\begin{enumerate}\n"

        for (let child of this.children) {
            text += child.tex;
        }
        return text + "\n\\end{enumerate}\n";
    }
}