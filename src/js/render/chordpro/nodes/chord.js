import { SyntaxTreeText } from "../abstractNodes/textNode.js";
import { sanitizeTex } from "../helper.js";

/**
 * Class implementing Chord ast node
 */
export class Chord extends SyntaxTreeText {
    /**
     * Sets focus to htmlElement representing this node
     */
    focus() {
        this.htmlElement.focus();
    }

    /**
     * 
     * @param {Event} event 
     */
    onLeave(event) {
        if (event.target !== null) {
            if (event.target.innerText.replace(" ", "") === "") {
                event.target.parentElement.removeChild(event.target);
                this.parent.removeChild(this);
            }
        }
    }

    get html() {
        this.htmlElement = document.createElement("span");
        this.htmlElement.setAttribute("class", "chord");
        super.html;
        this.htmlElement.innerText = this.innerText;
        return this.htmlElement;
    }

    get chordpro() {
        return "[" + this.innerText + "]";
    }

    get tex() {
        let text = sanitizeTex(this.innerText);
        return `\\chord{${text}}`
    }
}
