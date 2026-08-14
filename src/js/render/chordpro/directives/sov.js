import { DirectiveChildren } from "../abstractNodes/directiveWithChildren.js"
import { createVerseName } from "./helper.js"
import { sanitizeTex } from "../helper.js";


/**@import {SyntaxTreeNode} from "../abstractNodes/node.js" */


/**
 * Class implementing verse node
 */
export class Sov extends DirectiveChildren {
    static directiveName = "start_of_verse";
    static directiveShortcut = "sov";
    static directiveClosingName = "end_of_verse";
    static directiveClosingShortcut = "eov";
    static automaticSov = false;
    name = "";
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

    get html() {
        const element = document.createElement("div");
        element.setAttribute("class", "verse");
        if (this.name !== "") {
            element.appendChild(createVerseName(this.name + ":"));
        } else {
            element.appendChild(createVerseName(this.name));
        }

        const paragraph = document.createElement("p");
        paragraph.setAttribute("class", "verseContent");

        for (let child of this.children) {
            paragraph.appendChild(child.html);
        }

        element.appendChild(paragraph);
        return element;
    }
    get chordpro() {
        let text = "";
        if (this.generated) {
            text += "\n";
        } else {
            text += "\n{" + this.constructor.directiveName + ": " + this.name + "}";
        }

        for (let child of this.children) {
            text += child.chordpro;
        }
        if (!this.generated) {
            text += "\n{" + this.constructor.directiveClosingName + "}\n";
        }
        return text;
    }

    get tex() {
        let text = this.generated ? "\n\\sov " : `\n\\sov{${sanitizeTex(String(this.name))}} `;
        for (let child of this.children) {
            text += child.tex;
        }
        return text;
    }
}