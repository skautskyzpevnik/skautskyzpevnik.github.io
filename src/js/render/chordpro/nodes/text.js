import { SyntaxTreeNodeWithChildren } from "../abstractNodes/nodeWithChildren.js";
import { SyntaxTreeText } from "../abstractNodes/textNode.js";
import { glob } from "../globals.js";
import { sanitizeTex } from "../helper.js";
import { Chord } from "./chord.js";

/**
 * Class implementing text ast node
 */
export class Text extends SyntaxTreeText {

    /**
     * Reacts to leave of html element corresponding to this node
     * @param {Event} event 
     */
    onLeave(event) {
        if (event.target !== null) {
            if (event.target.innerText.replace(" ", "") === "") {
                this.remove();
            }
        }
    }

    /**
     * Creates chords from last range in this node
     */
    chord() {
        if (this.lastRange !== undefined && glob.contentEditable) {
            const secondText = this.innerText.slice(this.lastRange.stop);
            const chordText = this.innerText.slice(this.lastRange.start, this.lastRange.stop);
            const textPreChord = new Text(this.line, this.charNumber, this.innerText.slice(0, this.lastRange.start));
            const chord = new Chord(this.line, this.charNumber + this.innerText.length, chordText);
            const textPostChord = new Text(this.line, this.charNumber + this.innerText.length, secondText);
            if (this.parent instanceof SyntaxTreeNodeWithChildren) {
                this.parent.actionStart();
                this.parent.insertAfter(textPreChord, this)
                this.parent.insertAfter(chord, textPreChord);
                this.parent.insertAfter(textPostChord, chord);
                this.parent.removeChild(this);
                this.parent.actionEnd();
                this.parent.reRender();
                chord.focus();
            }
        }
    }

    /**
     * removes this node
     */
    remove() {
        if (this.htmlElement !== undefined) {
            this.htmlElement.parentElement.removeChild(this.htmlElement);
        }
        this.parent.removeChild(this);
    }

    get html() {
        this.htmlElement = document.createElement("span");
        this.htmlElement.setAttribute("class", "lyrics");
        super.html;
        this.htmlElement.innerText = this.innerText;
        if (this.innerText.charAt(this.innerText.length - 1) === " ") {
            this.htmlElement.innerHTML = this.htmlElement.innerHTML.slice(0, -1) + "&nbsp;";
        }
        if (this.innerText.charAt(0) === " " || this.innerText.charAt(0) === "") {
            this.htmlElement.innerHTML = "&nbsp;" + this.htmlElement.innerHTML.slice(1);
        }
        return this.htmlElement;
    }

    get chordpro() {
        return this.innerText;
    }

    get tex() {
        return sanitizeTex(this.innerText);
    }
}