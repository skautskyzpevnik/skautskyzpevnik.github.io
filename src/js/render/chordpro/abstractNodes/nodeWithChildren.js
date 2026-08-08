import { SyntaxTreeNode } from "./node.js";
import { Action } from "../journal.js";
import { glob } from "../globals.js";
import { InternalError } from "../helper.js";
/**
 * @typedef {import('../nodes/songbook.js').Songbook} Songbook
 */

/**
 * Abstract class representing node of ast that cane have child nodes
 */
export class SyntaxTreeNodeWithChildren extends SyntaxTreeNode{
    /**@type {htmlElement[]|undefined} */
    htmlElement = undefined;

    /** @type {ChildrenChange|undefined} */
    #activeAction = undefined;

    /**
     * Children of this node
     * @type {SyntaxTreeNode[]}
     */
    children = [];

    /**
     * 
     * @param {number} line line in source 
     * @param {number} charNumber charNumber in line in source
     */
    constructor(line, charNumber) {
        super();
        this.line = line;
        this.charNumber = charNumber;
    }

    /**
     * Returns node with specific id
     * @param {string} id 
     * @returns {SyntaxTreeNode|undefined} 
     */
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

    /**
     * Returns node after passed node
     * @param {SyntaxTreeNode} node 
     * @returns {SyntaxTreeNode|undefined}
     * @throws {InternalError} if child is of unsupported type
     */
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

    /**
     * Returns node previous passed node
     * @param {SyntaxTreeNode} node 
     * @returns {SyntaxTreeNode|undefined}
     * @throws {InternalError} if child is of unsupported type
     */
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

    /**
     * Inserts node after reference node
     * @param {SyntaxTreeNode} newNode 
     * @param {SyntaxTreeNode} referenceNode child of this node 
     */
    insertAfter(newNode, referenceNode) {
        if (!(newNode instanceof SyntaxTreeNode)) {
            throw new InternalError("Attempted to add child of unsupported type.");
        }
        let index = this.children.indexOf(referenceNode)+1;
        if (index !== -1) {
            if (this.#activeAction !== undefined){
                this.#activeAction.addNode(index, newNode);
            }
            this.insertIndex(newNode, index);
        }
    }

    /**
     * Inserts node before reference node
     * @param {SyntaxTreeNode} newNode 
     * @param {SyntaxTreeNode} referenceNode child of this node 
     */
    insertBefore(newNode, referenceNode) {
        if (!(newNode instanceof SyntaxTreeNode)) {
            throw new InternalError("Attempted to add child of unsupported type.");
        }
        let index = this.children.indexOf(referenceNode);
        if (index !== -1) {
            if (this.#activeAction !== undefined){
                this.#activeAction.addNode(index, newNode);
            }
            this.insertIndex(newNode, index);
        }
    }
    
    /**
     * Inserts node to specific index do not call directly
     * @param {SyntaxTreeNode} newNode 
     * @param {number} index
     */
    insertIndex(newNode, index){
        newNode.setParent(this);
        this.children.splice(index, 0, newNode);
    }

    /**
     * Rearranges internal structure
     */
    rearrange() {
        
    }

    /**
     * Removes child
     * @param {SyntaxTreeNode} child 
     */
    removeChild(child) {
        let index  = this.children.indexOf(child);
        if (index > -1) {
            if (this.#activeAction !== undefined){
                this.#activeAction.removeNode(index, child);
            }
            this.removeIndex(index);
        }
    }
    
    /**
     * Directly removes child do not use directly
     * @param {SyntaxTreeNode} child 
     */
    removeIndex(index) {
        this.children.splice(index, 1);
        this.rearrange();
    }

    /**
     * Appends node as last children
     * @param {SyntaxTreeNode} child 
     */
    appendChild(child) {
        if (this.#activeAction !== undefined){
            this.#activeAction.appendNode(this.children.length, newNode);
        }
        this.directAppendChild(child);
    }

    /**
     * Appends node as last children do not call directly
     * @param {SyntaxTreeNode} child
     */
    directAppendChild(child) {
        if (!(child instanceof SyntaxTreeNode)) {
            throw new InternalError("Attempted to add child of unsupported type.");
        }
        child.setParent(this);
        this.children.push(child);
    }

    actionStart(){
        if(this.#activeAction !== undefined){
            throw new InternalError("Previous action has not yet ended.");
        }
        this.#activeAction = new ChildrenChange(this.uniqueId);
    }
    actionEnd(){
        if(! (this.#activeAction instanceof ChildrenChange)){
            throw new InternalError("Action must be first started.");
        }else{
            glob.journal.addAction(this.#activeAction);
            this.#activeAction = undefined;            
        }
    }
}

class ChildrenChangeSubAction{
    
    index = -1;
    /** @type {SyntaxTreeNode | undefined} */
    node = undefined;
    /**
     * 
     * @param {number} index 
     * @param {SyntaxTreeNode} node 
     */
    constructor(index, node){
        this.index = index;
        this.node = node;
    }

    /**
     * Undo subAction
     * @param {Songbook} songBook 
     * @param {string} uniqueId 
     */
    undo(songBook, uniqueId){}
    /**
     * Redo subAction
     * @param {Songbook} songBook 
     * @param {string} uniqueId 
     */
    redo(songBook, uniqueId){}
    /**
     * Add node 
     * @param {Songbook} songBook 
     * @param {string} uniqueId 
     */
    add(songBook, uniqueId){
        let node = songBook.getNodeById(uniqueId);
        if(node !== undefined && node instanceof SyntaxTreeNodeWithChildren){
            node.insertIndex(this.node, this.index);
        }
    }
    /**
     * Remove node 
     * @param {Songbook} songBook 
     * @param {string} uniqueId 
     */
    remove(songBook, uniqueId){
        let node = songBook.getNodeById(uniqueId);
        if(node !== undefined && node instanceof SyntaxTreeNodeWithChildren){
            node.removeIndex(this.node, this.index);
        }
    }
}

class ChildrenChangeRemoveSubAction extends ChildrenChangeSubAction{
    /**
     * Undo subAction
     * @param {Songbook} songBook 
     * @param {string} uniqueId 
     */
    undo(songBook, uniqueId){
        this.add(songBook, uniqueId);
    }
    /**
     * Redo subAction
     * @param {Songbook} songBook 
     * @param {string} uniqueId 
     */
    redo(songBook, uniqueId){
        this.remove(songBook, uniqueId);
    }
};
class ChildrenChangeAddSubAction extends ChildrenChangeSubAction{
    /**
     * Undo subAction
     * @param {Songbook} songBook 
     * @param {string} uniqueId 
     */
    undo(songBook, uniqueId){
        this.remove(songBook, uniqueId);
    }
    /**
     * Redo subAction
     * @param {Songbook} songBook 
     * @param {string} uniqueId 
     */
    redo(songBook, uniqueId){
        this.add(songBook, uniqueId);
    }
};
class ChildrenChangeAppendSubAction extends ChildrenChangeSubAction{
    /**
     * Undo subAction
     * @param {Songbook} songBook 
     * @param {string} uniqueId 
     */
    undo(songBook, uniqueId){
        this.remove(songBook, uniqueId);
    }
    /**
     * Redo subAction
     * @param {Songbook} songBook 
     * @param {string} uniqueId 
     */
    redo(songBook, uniqueId){
        let node = songBook.getNodeById(uniqueId);
        if(node !== undefined && node instanceof SyntaxTreeNodeWithChildren){
            node.directAppendChild(this.node);
        }
    }
};

export class ChildrenChange extends Action {
    /** @type {ChildrenChangeSubAction[]} */
    subActions = []
    constructor(uniqueId){
        super(uniqueId);
    }

    /**
     * Adds add change in to this action
     * @param {number} index 
     * @param {SyntaxTreeNode} node 
     */
    addNode(index, node){
        this.subActions.push(new ChildrenChangeAddSubAction(index, node));
    }

    /**
     * Adds add change in to this action
     * @param {SyntaxTreeNode} node 
     */
    appendNode(index, node){
        this.subActions.push(new ChildrenChangeAppendSubAction(index, node));
    }

    /**
     * Adds add change in to this action
     * @param {number} index 
     * @param {SyntaxTreeNode} node 
     */
    removeNode(index, node){
        this.subActions.push(new ChildrenChangeRemoveSubAction(index, node));
    }
    /**
     * This undo an action
     * @param {Songbook} songBook songbook reference
     */
    undo(songBook){
        for(let i = 0; i < this.subActions.length; i++){
            let subAction = this.subActions[this.subActions.length - i -1];
            subAction.undo(songBook, this.nodeId);
        }
    }

    /**
     * This redo an action
     * @param {Songbook} songBook songbook reference
     */
    redo(songBook){
        for(let subAction of this.subActions){
            subAction.redo(songBook, this.nodeId);
        }
    }
}