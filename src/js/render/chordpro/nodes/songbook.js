import { SyntaxTreeNodeWithChildren } from "../abstractNodes/nodeWithChildren.js";
import { titlePageCreator } from "../../../titlepagecreator.js";

/**
 * Class implementing songbook ast node
 */
export class Songbook extends SyntaxTreeNodeWithChildren {
    title = "";
    subtitle = "";
    /**@type {string|undefined} */
    filename = undefined;
    get html() {
        let element = document.createElement("div");
        element.setAttribute("class", "song-book");
        if (this.title !== "" || this.subtitle !== "") {
            element.appendChild(titlePageCreator(this.title, this.subtitle))
        }
        for (let child of this.children) {
            try {
                element.appendChild(child.html);
            } catch (e) {
                console.error(e);
                console.log(child);
            }

        }
        return element;
    }
    get chordpro() {
        let text = "";
        for (let child of this.children) {
            text += child.chordpro;
        }
        return text;
    }

    get tex() {
        let text = "";
        for (let child of this.children) {
            text += child.tex;
        }
        return text;
    }
}