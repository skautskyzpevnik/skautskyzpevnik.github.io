import { SyntaxTreeLeafNode } from "./leafNode.js";
import { Action } from "../journal.js";
import { glob } from "../globals.js";
/**
 * @typedef {import('./songbook.js').Songbook} Songbook
 */

/**
 * Abstract Class for text ast nodes
 */
export class SyntaxTreeText extends SyntaxTreeLeafNode{
    innerText = "";
    /**@type {htmlElement[]|undefined} */
    htmlElement = undefined;
    /**
     * 
     * @param {number} line line in source 
     * @param {number} charNumber charnumber in line in source
     * @param {string} innerText inner text 
     */
    constructor(line, charNumber, innerText) {
        super(line, charNumber);
        this.innerText = innerText;
    }

    get innerText() {
        return this.innerText;
    }

    set innerText(newInnerText) {
        this.innerText = newInnerText;
        if (this.htmlElement !== undefined) {
            this.htmlElement.innerText = newInnerText;
        }
    }

    /**
     * Sets the text of the node
     * @param {string} text 
     */
    setText(text){
        this.innerText = text;
        this.htmlElement.innerText = text;
    }

    /**
     * Reacts to edit of html element corresponding to this node
     * @param {Event} event 
     */
    onEdit(event) {
        this.#editText(event.target.innerText);
    }

    /**
     * Edits inner text and adds action to journal
     * @param {*} text 
     */
    #editText(text){
        glob.journal.addAction(new ActionChangeText(this.uniqueId, this.innerText, text));
        this.innerText = text;
    }
}

export class ActionChangeText extends Action{
    prevText = "";
    newText = "";
    constructor(nodeId, prevText, newText){
        super(nodeId);
        this.prevText = prevText;
        this.newText = newText;
    }
    /**
     * This undo an action
     * @param {Songbook} songBook songbook reference
     */
    undo(songBook){
        let node = songBook.getNodeById(this.nodeId);
        if(node !== undefined && node instanceof SyntaxTreeText){
            node.setText(this.prevText);
        }
    }

    /**
     * This redo an action
     * @param {Songbook} songBook songbook reference
     */
    redo(songBook){
        let node = songBook.getNodeById(this.nodeId);
        if(node !== undefined && node instanceof SyntaxTreeText){
            node.setText(this.newText);
        }
    }

}