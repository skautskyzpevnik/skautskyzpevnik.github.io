import { titlePageCreator } from "../../titlepagecreator.js"
import { linkToHtmlAttribute } from "./observer.js";
import { glob, uniqueNumber } from "./globals.js";

import { currentSongBook } from "../index.js";
import { rangeInsideElement } from "./utils.js";

export class SyntaxTreeNode{
    line = 0;
    charNumber = 0;
    parent = undefined;
    uniqueId = 0;

    constructor() {
        this.uniqueId = String(uniqueNumber());
    }

    getNodeById(id) {
        if (this.uniqueId === id) {
            return this;
        } else {
            return undefined;
        }
    }

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
    htmlElement = undefined;
    lastRange = undefined;
    constructor(line, charNumber) {
        super();
        this.line = line;
        this.charNumber = charNumber;
    }

    setSelection(start, stop, collapse) {
        if (this.htmlElement !== undefined) {
            const range = document.createRange();
            const select = window.getSelection();
            range.setStart(this.htmlElement, start);
            range.setEnd(this.htmlElement, stop);
            range.collapse(collapse);
            select.removeAllRanges();
            select.addRange(range);
            this.lastRange = range;
        }
    }

    getSelection() {
        let start = 0;
        let stop = 0;
        let collapse = false;
        if (window.getSelection) {
            let sel = window.getSelection();
            if (sel.rangeCount) {
                let range = sel.getRangeAt(0);
                if (range.commonAncestorContainer.parentNode === this.htmlElement) {
                    start = range.startOffset;
                    stop = range.endOffset;
                    collapse = range.startOffset === range.endOffset;
                }
            }
        }

        return {
            "start": start,
            "stop": stop,
            "collapse": collapse
        };
    }

    hasFocus() {
        if (this.htmlElement !== undefined) {
            return this.htmlElement === document.activeElement;
        } else {
            return false;
        }
    }
    onFocus(event) {
        glob.activeAstNode = this;
    }

    onLeave(event) { }
    onEdit(event) { }
    onSelectionChange(event) {
        if (this.htmlElement !== undefined) {
            this.lastRange = rangeInsideElement(event.detail.range, this.htmlElement);
        }
    }

    /**
     * @param {HTMLElement} htmlElement
     */
    get html() {
        if (this.htmlElement !== undefined) {
            this.htmlElement.setAttribute("data-astid", this.uniqueId);
            linkToHtmlAttribute(glob, "contentEditable", this.htmlElement, "contenteditable");
            this.htmlElement.addEventListener("customselectionchange", (event) => this.onSelectionChange(event));
            this.htmlElement.addEventListener("input", (event) => this.onEdit(event));
            this.htmlElement.addEventListener("blur", (event) => this.onLeave(event));
            this.htmlElement.addEventListener("focus", (event) => this.onFocus(event));
        }
        return this.htmlElement;
    }
}

export class SyntaxTreeNodeWithChildren extends SyntaxTreeNode{
    htmlElement = undefined;

     /**
     * Children of this node
     * @type {SyntaxTreeNode[]}
     */
     children = [];


    constructor(line, charNumber) {
        super();
        this.line = line;
        this.charNumber = charNumber;
    }

    getNodeById(id) {
        if (this.uniqueId === id) {
            return this;
        } else {
            for (const node of this.children) {
                let result = node.getNodeById(id);
                if (result !== undefined) {
                    return result;
                }
            }
            return undefined;
        }
    }

    insertAfter(newNode, referenceNode) {
        if (!(newNode instanceof SyntaxTreeNode)) {
            throw new InternalError("Attempted to add child of unsupported type.");
        }
        newNode.setParent(this);
        let index = this.children.indexOf(referenceNode);
        if (index !== -1) {
            this.children.splice(index + 1, 0, newNode);
        }    
    }

    insertBefore(newNode, referenceNode) {
        if (!(newNode instanceof SyntaxTreeNode)) {
            throw new InternalError("Attempted to add child of unsupported type.");
        }
        newNode.setParent(this);
        let index = this.children.indexOf(referenceNode);
        if (index !== -1) {
            this.children.splice(index, 0, newNode);
        }
    }

    nextNode(node) {
        if (!(node instanceof SyntaxTreeNode)) {
            throw new InternalError("Attempted to add child of unsupported type.");
        }
        node.setParent(this);
        let index = this.children.indexOf(referenceNode);
        if (index !== -1 && index + 1 < this.children.length) {
            return this.children[index + 1];
        } else {
            return undefined;
        }
    }
    previousNode(node) {
        if (!(node instanceof SyntaxTreeNode)) {
            throw new InternalError("Attempted to add child of unsupported type.");
        }
        node.setParent(this);
        let index = this.children.indexOf(referenceNode);
        if (index !== -1 && index - 1 > -1) {
            return this.children[index - 1];
        } else {
            return undefined;
        }
    }
    
    rearrange() {
        
    }

    removeChild(child) {
        let index  = this.children.indexOf(child);
        if (index > -1) {
          this.children.splice(index, 1);
        }
        this.rearrange();
    }

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
    filename = undefined;
    get html() {
        let element = document.createElement("div");
        element.setAttribute("class", "song-book");
        if (this.title !== "" || this.subtitle !== "") {
            element.appendChild(titlePageCreator(this.title, this.subtitle))
        }
        for (let child of this.children) {
            try {
                element.appendChild(child.html);
            } catch (e) {
                console.error(e);
                console.log(child);
            }
            
        }
        return element;
     }
     get chordpro() {
        let text = "";
        for (let child of this.children) {
            text += child.chordpro;
        }
        return text;
    }
}

export class Song extends SyntaxTreeNodeWithChildren{
    title = "";
    artist = "";
    filename = undefined;
    chorusIndex = {}
    lastChorus = undefined;
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
    get chordpro() {
        let text = "\n{ns}" + "\n";
        if (this.title !== "") {
            text +=  "{title: " + this.title + "}\n"
        }
        if (this.artist !== "") {
            text +=  "{artist: " + this.artist + "}\n"
        }
        for (let child of this.children) {
            text += child.chordpro;
        }
        return text;
    }
}

export class Text extends SyntaxTreeLeafNode{
    #innerText = "";
    htmlElement = undefined;
    constructor(line, charNumber, innerText) {
        super(line, charNumber);
        this.#innerText = innerText;
    }

    get innerText() {
        return this.#innerText;
    }

    set innerText(newInnerText) {
        this.#innerText = newInnerText;
        if (this.htmlElement !== undefined) {
            this.htmlElement.innerText = newInnerText;
        }
    }

    onEdit(event) {
        this.#innerText = event.target.innerText;
    }

    /**
     * 
     * @param {Event} event 
     */
    onLeave(event) {
        if (event.target !== null) {
            if (event.target.innerText.replace(" ", "") === "") {
                this.remove();
            }
        }
    }

    chord() {
        if (this.lastRange !== undefined && glob.contentEditable) {
            const secondText = this.#innerText.slice(this.lastRange.stop);
            const chordText = this.#innerText.slice(this.lastRange.start, this.lastRange.stop);
            this.innerText = this.#innerText.slice(0, this.lastRange.start);
            const chord = new Chord(this.line, this.charNumber + this.innerText.length, chordText);
            const text = new Text(this.line, this.charNumber + this.innerText.length, secondText);
            this.parent.insertAfter(chord, this);
            this.parent.insertAfter(text, chord);
            this.parent.reRender();
            chord.focus();
        }
    }

    remove() {
        if (this.htmlElement !== undefined) {
            this.htmlElement.parentElement.removeChild(this.htmlElement);
        }
        this.parent.removeChild(this);
    }

    get html() {
        this.htmlElement = document.createElement("span");
        this.htmlElement.setAttribute("class", "lyrics");
        super.html;
        this.htmlElement.innerText = this.innerText;
        if (this.innerText.charAt(this.innerText.length - 1) === " ") {
            this.htmlElement.innerHTML = this.htmlElement.innerHTML.slice(0, -1) + "&nbsp;";
        }
        if (this.innerText.charAt(0) === " " || this.innerText.charAt(0) === "") {
            this.htmlElement.innerHTML = "&nbsp;" + this.htmlElement.innerHTML.slice(1);
        }
        return this.htmlElement;
    }

    get chordpro() {
        return this.innerText;
    }
}

export class Chord extends SyntaxTreeLeafNode{
    #innerText = "";
    htmlElement = undefined;
    constructor(line, charNumber, innerText) {
        super(line, charNumber);
        this.innerText = innerText;
    }

    get innerText() {
        return this.#innerText;
    }

    set innerText(newInnerText) {
        this.#innerText = newInnerText;
        if (this.htmlElement !== undefined) {
            this.htmlElement.innerText = newInnerText;
        }
    }

    onEdit(event) {
        this.#innerText = event.target.innerText;
    }

    focus() {
        this.htmlElement.focus();
    }

    /**
     * 
     * @param {Event} event 
     */
    onLeave(event) {
        if (event.target !== null) {
            if (event.target.innerText.replace(" ", "") === "") {
                event.target.parentElement.removeChild(event.target);
                this.parent.removeChild(this);
            }
        }
    }
    
    get html() {
        this.htmlElement = document.createElement("span");
        this.htmlElement.setAttribute("class", "chord");
        super.html;
        this.htmlElement.innerText = this.innerText;
        return this.htmlElement;
    }

    get chordpro() {
        return "[" + this.innerText + "]";
    }
}

export class Line extends SyntaxTreeNodeWithChildren{
    innerText = "\n";
    constructor(line, charNumber) {
        super(line, charNumber);
    }

    rearrange() {
        let i = 0;
        while (i+1 < this.children.length) {
            if (this.children[i] instanceof Text && this.children[i + 1] instanceof Text) {
                let hasFocus = false;
                let start = 0;
                let stop = 0;
                let collapse = false;
                if (this.children[i].hasFocus()) {
                    hasFocus = true;
                    ({ start, stop, collapse } = this.children[i].getSelection());
                }
                if (this.children[i+1].hasFocus()) {
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
        for (let child of this.children) {
            if (child instanceof Chord) {
                if (active !== this.htmlElement) {
                    this.htmlElement.appendChild(active);
                }
                active = document.createElement("div");
                active.setAttribute("class", "chordLyricsWrapper");
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
        let text = this.innerText;
        for (let child of this.children) {
            text += child.chordpro;
        }
        return text;
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