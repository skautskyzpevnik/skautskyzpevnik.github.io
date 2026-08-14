import { SyntaxTreeNodeWithChildren } from "../abstractNodes/nodeWithChildren.js";
import { sanitizeTex } from "../helper.js";
import { Chord } from "./chord.js";
import { Text } from "./text.js";

/**
 * Class implementing Line ast node
 */
export class Line extends SyntaxTreeNodeWithChildren {
    innerText = "\n";
    constructor(line, charNumber) {
        super(line, charNumber);
    }

    /**
     * rearranges and merges childNodes
     */
    rearrange() {
        let i = 0;
        while (i + 1 < this.children.length) {
            if (this.children[i] instanceof Text && this.children[i + 1] instanceof Text) {
                let hasFocus = false;
                let start = 0;
                let stop = 0;
                let collapse = false;
                if (this.children[i].hasFocus()) {
                    hasFocus = true;
                    ({ start, stop, collapse } = this.children[i].getSelection());
                }
                if (this.children[i + 1].hasFocus()) {
                    hasFocus = true;
                    ({ start, stop, collapse } = this.children[i + 1].getSelection());
                    start += this.children[i].length;
                    stop += this.children[i].length;
                    collapse += this.children[i].length;
                }
                this.children[i].innerText += this.children[i + 1].innerText;
                this.children[i + 1].remove();
                if (hasFocus && collapse) {
                    this.children[i].setSelection(start, stop, collapse);
                }
            } else {
                i++;
            }
        }
    }

    /**
     * rerenders this node
     */
    reRender() {
        if (this.htmlElement === undefined) {
            this.htmlElement = document.createElement("div");
            this.htmlElement.setAttribute("class", "linewrapper");
        } else {
            this.htmlElement.innerHTML = "";
        }
        let active = this.htmlElement;
        if (this.children[this.children.length - 1] instanceof Chord) {
            this.appendChild(new Text(this.line, this.charNumber, ""));
        }
        let wasPrevChord = false;
        for (let child of this.children) {
            if (child instanceof Chord) {
                if (!wasPrevChord) {
                    if (active !== this.htmlElement) {
                        this.htmlElement.appendChild(active);
                    }
                    active = document.createElement("div");
                    active.setAttribute("class", "chordLyricsWrapper");
                    wasPrevChord = true;
                }
            } else {
                wasPrevChord = false;
            }
            active.appendChild(child.html);
        }
        if (active !== this.htmlElement) {
            this.htmlElement.appendChild(active);
        }
    }

    get html() {
        this.reRender();
        return this.htmlElement;
    }

    get chordpro() {
        let text = this.innerText == "\n" ? "" : this.innerText;
        for (let child of this.children) {
            text += child.chordpro;
        }
        return text + "\n";
    }

    get tex() {
        let text = sanitizeTex(this.innerText);
        for (let child of this.children) {
            text += child.tex;
        }
        return text + "\n";
    }
}