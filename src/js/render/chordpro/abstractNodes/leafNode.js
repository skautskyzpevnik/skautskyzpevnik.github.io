import { SyntaxTreeNode } from "./node.js";
import { linkToHtmlAttribute } from "../observer.js";
import { glob } from "../globals.js";
import { rangeInsideElement } from "../utils.js";

/**
 * Abstract class representing specific type of leaf nodes of ast (like Chord or Text)
 */
export class SyntaxTreeLeafNode extends SyntaxTreeNode{
    /**@type {htmlElement[]|undefined} */
    htmlElement = undefined;
    /**@type {Range} */
    lastRange = undefined;
    /**
     * 
     * @param {number} line line in source 
     * @param {number} charNumber charnumber in line in source
     */
    constructor(line, charNumber) {
        super();
        this.line = line;
        this.charNumber = charNumber;
    }

    /**
     * Sets selection inside this node
     * @param {number} start 
     * @param {number} stop 
     * @param {boolean} collapse 
     */
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

    /**
     * Gets selection from this node 
     * @returns 
     */
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

    /**
     * Tests if this node has focus
     * @returns 
     */
    hasFocus() {
        if (this.htmlElement !== undefined) {
            return this.htmlElement === document.activeElement;
        } else {
            return false;
        }
    }
    /**
     * Fires on focus event on this node
     * @param {Event} event 
     */
    onFocus(event) {
        glob.activeAstNode = this;
    }
    /**
     * Fires on leave event on this node
     * @param {Event} event 
     */
    onLeave(event) { }
    /**
     * Fires on edit event on this node
     * @param {Event} event 
     */
    onEdit(event) { }
    /**
     * Fires on SelectionChange event on this node (using custom bobbling event)
     * @param {Event} event 
     */
    onSelectionChange(event) {
        if (this.htmlElement !== undefined) {
            this.lastRange = rangeInsideElement(event.detail.range, this.htmlElement);
        }
    }

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