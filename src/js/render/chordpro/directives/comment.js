import { Directive } from "../abstractNodes/directive.js";
import { SemanticsError } from "./helper.js";

/**
 * Class implementing comment link node
 */
export class Comment extends Directive {
    /**@type {string} */
    #text = "";
    static directiveName = "comment";
    static directiveShortcut = "c";
    /**
     * @param {number} line line in source 
     * @param {number} charNumber charnumber in line in source
     * @param {string} unnamedArgument 
     * @param {Array} namedArguments
     */
    constructor(line, charNumber, unnamedArgument, namedArguments) {
        super(line, charNumber, unnamedArgument, namedArguments);
        if (typeof unnamedArgument !== "string") {
            throw new SemanticsError("Comment must have string argument", line, charNumber);
        }
        this.#text = unnamedArgument;
    }
    get html() {
        const element = document.createElement("div");
        element.setAttribute("class", "comment");
        element.innerText = "Komentář: " + String(this.#text);
        return element;
    }
    get chordpro() {
        let text = "";
        if (this.#text !== "") {
            text = "\n\n{" + this.constructor.directiveName + ": " + this.#text + "}";
        }
        return text;
    }

    get tex() {
        return `\\${this.constructor.directiveName}[${sanitizeTex(String(this.#text))}]`
    }
}