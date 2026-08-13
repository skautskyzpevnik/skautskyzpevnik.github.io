import { Directive } from "../abstractNodes/directive.js";
import { Song } from "../nodes/song.js"
import { SemanticsError } from "./helper.js";
import { getAbove } from "../utils.js"

/**
 * @import {SyntaxTreeNode} from "../abstractNodes/node.js"
 * @import {Soc} from "./soc.js"
 */

/**
 * Class implementing chorus link node
 */
export class Chorus extends Directive {
    /**@type {Soc|undefined} */
    #linked = undefined;
    static directiveName = "chorus";
    static directiveShortcut = undefined;
    name = "";
    /**
     * @param {number} line line in source 
     * @param {number} charNumber charnumber in line in source
     * @param {string} unnamedArgument 
     * @param {Array} namedArguments
     */
    constructor(line, charNumber, unnamedArgument, namedArguments) {
        super(line, charNumber, unnamedArgument, namedArguments);
        this.name = unnamedArgument;

    }

    /**
     * Helper function that sets parent node
     * SHOULD be called only by its parent 
     * @param {SyntaxTreeNode|undefined} node 
     */
    setParent(node) {
        super.setParent(node);
        /** @type {Song} */
        let song = getAbove(Song, this);
        if (this.name === "" && song.lastChorus !== undefined) {
            this.#linked = song.lastChorus;
        } else if (song.chorusIndex[this.name] !== undefined) {
            this.#linked = song.chorusIndex[this.name];
        } else {
            throw new SemanticsError("Chorus link before chorus", this.lineNumber, this.charNumber);
        }
    }

    get html() {
        const element = document.createElement("div");
        element.setAttribute("class", "choruslink");
        element.innerText = this.#linked.name;
        return element;
    }

    get chordpro() {
        if (this.#linked.generated) {
            return `\n\n{${this.constructor.directiveName}: ${this.#linked.name}}`;
        } else {
            return `\n\n{${this.constructor.directiveName}}`;
        }

    }

    get tex() {
        return `\n\\chorus[${sanitizeTex(this.#linked.name)}]\n`
    }
}