import { titlePageCreator } from "../../titlepagecreator.js"

export class SyntaxTreeNode{
    line = 0;
    charNumber = 0;
    parent = undefined;

    setParent(node) {
        this.parent = node;
    }
    getClassNode(getClass) {
        if (this instanceof getClass) {
            return this;            
        } else if (this.parent === undefined) {
            return undefined;
        } else {
            return this.parent.getClassNode(getClass);
        }
    }
    toJSON() {
        const { parent, ...rest } = this;
        return rest;
    }
}

export class SyntaxTreeLeafNode extends SyntaxTreeNode{
    constructor(line, charNumber) {
        super();
        this.line = line;
        this.charNumber = charNumber;
    }
}

export class SyntaxTreeNodeWithChildren extends SyntaxTreeNode{   
    constructor(line, charNumber) {
        super();
        this.line = line;
        this.charNumber = charNumber;
    }
    
    /**
     * Children of this node
     * @member {SyntaxTreeNode[]}
     */
    children = [];

    appendChild(child) {
        if (!(child instanceof SyntaxTreeNode)) {
            throw new InternalError("Attempted to add child of unsupported type.");
        }
        child.setParent(this);
        this.children.push(child);
    }
}

export class Songbook extends SyntaxTreeNodeWithChildren{
    title = "";
    subtitle = "";
     get html() {
        let element = document.createElement("div");
        element.setAttribute("class", "song-book");
        if (this.title !== "" || this.subtitle !== "") {
            element.appendChild(titlePageCreator(this.title, this.subtitle))
        }
        for (let child of this.children) {
            element.appendChild(child.html);
        }
        return element;
    }
}

export class Song extends SyntaxTreeNodeWithChildren{
    title = "";
    artist = "";
    get html() {
        let element = document.createElement("div");
        element.setAttribute("class", "songholder");
        element.setAttribute("data-title", this.title);
        element.setAttribute("data-artist", this.artist);

        let heading = document.createElement("h1");
        heading.innerText = this.title + " - " + this.artist;
        element.appendChild(heading);

        for (let child of this.children) {
            element.appendChild(child.html);
        }

        return element;
    }
}

export class Text extends SyntaxTreeLeafNode{
    innerText = "";
    constructor(line, charNumber, innerText) {
        super(line, charNumber);
        this.innerText = innerText;
    }
    get html() {
        const lyricsHolder = document.createElement("span");
        lyricsHolder.setAttribute("class", "lyrics");
        lyricsHolder.innerText = this.innerText;
        if (this.innerText.charAt(this.innerText.length-1) === " ") {
            lyricsHolder.innerHTML = lyricsHolder.innerHTML.slice(0, -1) + "&nbsp;";
        }
        if (this.innerText.charAt(0) === " ") {
            lyricsHolder.innerHTML = "&nbsp;" + lyricsHolder.innerHTML.slice(1);
        }
        return lyricsHolder;
    }
}

export class Chord extends SyntaxTreeLeafNode{
    innerText = "";
    constructor(line, charNumber, innerText) {
        super(line, charNumber);
        this.innerText = innerText;
    }

    get html() {
        const chordHolder = document.createElement("span");
		chordHolder.setAttribute("class", "chord");
        chordHolder.innerText = this.innerText;
        return chordHolder;
    }

}
export class Line extends SyntaxTreeNodeWithChildren{
    innerText = "\n";
    constructor(line, charNumber) {
        super(line, charNumber);
    }

    get html() {
        let element = document.createElement("div");
        element.setAttribute("class", "linewrapper");
        
        let active = element;
        for (let child of this.children) {
            if (child instanceof Chord) {
                if (active !== element) {
                    element.appendChild(active);
                }
                active = document.createElement("div");
                active.setAttribute("class", "chordLyricsWrapper");
            }
            active.appendChild(child.html);
        }
        if (active !== element) {
            element.appendChild(active);
        }
        return element;
    }
}

/**
 * Directive that does not result in node in syntax tree.
 * It only affects metadata of some other node.
 */
export class MetaDirective extends SyntaxTreeNode{
    static directiveName;
    static directiveShortcut;
    
    static generateSideEffects(unnamedArgument, namedArguments, activeNode) {
        
    }
}

export class Directive extends SyntaxTreeNode{
    static directiveName;
    static directiveShortcut;
    
    line = 0;
    charNumber = 0
    constructor(line, charNumber, unnamedArgument, namedArguments) {
        super();
        this.line = line;
        this.charNumber = charNumber;
    }
}

export class DirectiveChildren extends SyntaxTreeNodeWithChildren{
    static directiveName;
    static directiveShortcut;
    static directiveClosingName;
    static directiveClosingShortcut;
    static automaticSov = true;
    
    line = 0;
    charNumber = 0
    constructor(line, charNumber, unnamedArgument, namedArguments) {
        super();
        this.line = line;
        this.charNumber = charNumber;
    }
}