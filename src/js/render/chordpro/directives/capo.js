import { Directive } from "../abstractNodes/directive.js";
import { sanitizeTex } from "../helper.js";

/**
 * Class implementing capo link node
 */
export class Capo extends Directive {
    /**@type {Number|undefined} */
    #capoSettings = undefined;
    static directiveName = "capo";
    static directiveShortcut = undefined;
    /**
     * @param {number} line line in source 
     * @param {number} charNumber charnumber in line in source
     * @param {string} unnamedArgument 
     * @param {Array} namedArguments
     */
    constructor(line, charNumber, unnamedArgument, namedArguments) {
        super(line, charNumber, unnamedArgument, namedArguments);
        this.#capoSettings = Number(unnamedArgument);
        if (Number.isNaN(this.#capoSettings)) {
            throw new SemanticsError("Capo must have numeric argument", line, charNumber);
        }
    }
    get html() {
        const element = document.createElement("div");
        element.setAttribute("class", "capo");
        element.innerText = "Kapo " + String(this.#capoSettings);
        return element;
    }
    get chordpro() {
        let text = "";
        if (this.#capoSettings !== undefined) {
            text = "\n\n{" + this.constructor.directiveName + ": " + this.#capoSettings + "}";
        }
        return text;
    }

    get tex() {
        return `\\${this.constructor.directiveName}{${sanitizeTex(String(this.#capoSettings))}}`
    }
}