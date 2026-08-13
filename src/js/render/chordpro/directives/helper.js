import { Title } from "./title.js";
import { Artist } from "./artist.js";
import { Soc } from "./soc.js";
import { Sov } from "./sov.js";
import { Chorus } from "./chorus.js";
import { Capo } from "./capo.js";
import { Comment } from "./comment.js";

/** list of known directives */
const directiveList = [Title, Artist, Soc, Sov, Chorus, Capo, Comment];

/**
 * Search and returns directive class
 * @param {string} name 
 * @returns {Class}
 */
export function directiveSearch(name) {
    if (name === undefined) {
        console.warn("undefined");
        return undefined;
    }
    for (let directive of directiveList) {
        if (directive.directiveName === name || directive.directiveShortcut === name) {
            return directive;
        }
    }
    return undefined;
}

/**
 * Create verse name html element
 * @param {string} name 
 * @returns {HTMLElement}
 */
export function createVerseName(name) {
    let span = document.createElement("span");
    span.innerText = name;
    span.setAttribute("class", "verseName")
    return span;
}

/**
 * Class representing semantics error in parser
 */
export class SemanticsError extends Error {
    constructor(message, lineNumber, charNumber) {
        super("Semantics error: " + message + "\n on line: " + lineNumber + " char: " + charNumber)
    }
}