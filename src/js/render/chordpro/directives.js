import { Directive, MetaDirective, DirectiveChildren, Song, SyntaxTreeNode } from "./ast.js"

function createChordProName(name){
	let span = document.createElement("span");
	span.innerText = name;
	span.setAttribute("class", "verseName")
	return span;
}

export class Title extends MetaDirective{
    static directiveName = "title";
    static directiveShortcut = "t";
    /**
     * 
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

export class Artist extends MetaDirective{
    static directiveName = "artist";
    static directiveShortcut = undefined;
    /**
     * 
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

export class Soc extends DirectiveChildren {
    static directiveName = "start_of_chorus";
    static directiveShortcut = "soc";
    static directiveClosingName = "end_of_chorus";
    static directiveClosingShortcut = "eoc";
    static automaticSov = false;
    name = "R";
    constructor(line, charNumber, unnamedArgument, namedArguments) {
        super(line, charNumber, unnamedArgument, namedArguments);
        if (unnamedArgument !== "") {
            this.name = unnamedArgument;
        }
    }

    get html() {
        const element = document.createElement("div");
        element.setAttribute("class", "chorus");
        element.appendChild(createChordProName(this.name + ":"));
        const paragraph = document.createElement("p");
        paragraph.setAttribute("class", "chorusContent");

        for (let child of this.children) {
            paragraph.appendChild(child.html);
        }

        element.appendChild(paragraph);
        return element;
    }
}

export class Sov extends DirectiveChildren {
    static directiveName = "start_of_verse";
    static directiveShortcut = "sov";
    static directiveClosingName = "end_of_verse";
    static directiveClosingShortcut = "eov";
    static automaticSov = false;
    name = "";
    constructor(line, charNumber, unnamedArgument, namedArguments) {
        super(line, charNumber, unnamedArgument, namedArguments);
        if (unnamedArgument !== "") {
            this.name = unnamedArgument;
        }
    }

    get html() {
        const element = document.createElement("div");
        element.setAttribute("class", "verse");
        element.appendChild(createChordProName(this.name + ":"));
        const paragraph = document.createElement("p");
        paragraph.setAttribute("class", "verseContent");

        for (let child of this.children) {
            paragraph.appendChild(child.html);
        }

        element.appendChild(paragraph);
        return element;
    }
}

export class Chorus extends Directive {
    static directiveName = "chorus";
    static directiveShortcut = undefined;
    constructor(line, charNumber, unnamedArgument, namedArguments) {
        super(line, charNumber, unnamedArgument, namedArguments);
        this.name = unnamedArgument;
    }
    get html() {
        const element = document.createElement("div");
        return element;
    }
}

const directiveList = [Title, Artist, Soc, Sov, Chorus];

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