import { Directive, MetaDirective, DirectiveChildren, Song, SyntaxTreeNode } from "./ast.js"
import { getAbove } from "./utils.js"

/**
 * Class representing semantics error in parser
 */
export class SemanticsError extends Error {
    constructor(message, lineNumber, charNumber) {
        super("Semantics error: " + message + "\n on line: " + lineNumber + " char: " + charNumber)
    }
}

/**
 * Create verse name html element
 * @param {string} name 
 * @returns {HTMLElement}
 */
function createVerseName(name){
	let span = document.createElement("span");
	span.innerText = name;
	span.setAttribute("class", "verseName")
	return span;
}

/**
 * Class implementing Title meta directive
 */
export class Title extends MetaDirective{
    static directiveName = "title";
    static directiveShortcut = "t";
    /**
     * Generate side effect of the directive
     * @param {string} unnamedArgument 
     * @param {Array} namedArguments 
     * @param {SyntaxTreeNode} activeNode 
     */
    static generateSideEffects(unnamedArgument, namedArguments, activeNode) {
        let songNode = activeNode.getClassNode(Song);
        if (songNode === undefined) {
            console.warn("Song not found.");
        } else {
            songNode.title = unnamedArgument;
        }
    }
}

/**
 * Class implementing Artist meta directive
 */
export class Artist extends MetaDirective{
    static directiveName = "artist";
    static directiveShortcut = undefined;
    /**
     * Generate side effect of the directive
     * @param {string} unnamedArgument 
     * @param {Array} namedArguments 
     * @param {SyntaxTreeNode} activeNode 
     */
    static generateSideEffects(unnamedArgument, namedArguments, activeNode) {
        let songNode = activeNode.getClassNode(Song);
        if (songNode === undefined) {
            console.warn("Song not found.");
        } else {
            songNode.artist = unnamedArgument;
        }
    }
}

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
        if (unnamedArgument !== ""&& unnamedArgument !== undefined) {
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
}

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
}

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
    get html() {
        const element = document.createElement("div");
        element.setAttribute("class", "choruslink");
        let song = getAbove(Song, this);
        if (song !== undefined) {
            if (this.name !== "") {
                this.#linked = song.chorusIndex[this.name];
            } else {
                this.#linked = song.lastChorus;
            }
            if (this.#linked === undefined) {
                throw new SemanticsError("Unknown chorus", this.line, this.charNumber);
            } else {
                element.innerText = this.#linked.name;
            }
        } else {
            console.warn("Broken tree!")
        }
        return element;
    }
    get chordpro() {
        let text = "";
        if (this.#linked !== undefined && this.#linked.name !== undefined) {
            text = "\n\n{" + this.constructor.directiveName + ": " + this.#linked.name +   "}";
        } else {
            text = "\n\n{" + this.constructor.directiveName + "}";
        }
        return text;
    }
}

/** list of known directives */
const directiveList = [Title, Artist, Soc, Sov, Chorus];

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