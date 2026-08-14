import { DirectiveChildren } from "../abstractNodes/directiveWithChildren.js"
import { Song } from "../nodes/song.js"
import { createVerseName } from "./helper.js"
import { getAbove } from "../utils.js"
import { sanitizeTex } from "../helper.js";


/**@import {SyntaxTreeNode} from "../abstractNodes/node.js" */

/**
 * Class implementing chorus node
 */
export class Soc extends DirectiveChildren {
    static directiveName = "start_of_chorus";
    static directiveShortcut = "soc";
    static directiveClosingName = "end_of_chorus";
    static directiveClosingShortcut = "eoc";
    static automaticSov = false;
    name = "R";
    generated = true;
    /**
     * @param {number} line line in source 
     * @param {number} charNumber charnumber in line in source
     * @param {string} unnamedArgument 
     * @param {Array} namedArguments
     */
    constructor(line, charNumber, unnamedArgument, namedArguments) {
        super(line, charNumber, unnamedArgument, namedArguments);
        if (unnamedArgument !== "" && unnamedArgument !== undefined) {
            this.name = unnamedArgument;
            this.generated = false;
        }
    }

    /**
     * Helper function that sets parent node
     * SHOULD be called only by its parent 
     * @param {SyntaxTreeNode|undefined} node 
     */
    setParent(node) {
        super.setParent(node);
        let song = getAbove(Song, this);
        if (song !== undefined) {
            song.chorusIndex[this.name] = this;
            song.lastChorus = this;
        } else {
            console.warn("Broken tree!")
        }
    }

    get html() {
        const element = document.createElement("div");
        element.setAttribute("class", "chorus");
        element.appendChild(createVerseName(this.name + ":"));
        const paragraph = document.createElement("p");
        paragraph.setAttribute("class", "chorusContent");

        for (let child of this.children) {
            paragraph.appendChild(child.html);
        }

        element.appendChild(paragraph);
        return element;
    }
    get chordpro() {
        let text = "";
        if (this.generated) {
            text += "\n\n{" + this.constructor.directiveName + "}";
        } else {
            text += "\n\n{" + this.constructor.directiveName + ": " + this.name + "}";
        }

        for (let child of this.children) {
            text += child.chordpro;
        }
        text += "\n{" + this.constructor.directiveClosingName + "}";
        return text;
    }

    get tex() {
        let text = `\n\\soc{${sanitizeTex(this.name)}} `;
        for (let child of this.children) {
            text += child.tex;
        }
        return text;
    }
}