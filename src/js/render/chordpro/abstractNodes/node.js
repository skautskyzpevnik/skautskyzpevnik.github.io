import { uniqueNumber } from "../globals.js";

/**
 * Abstract class representing any ast node
 */
export class SyntaxTreeNode{
    line = 0;
    charNumber = 0;
    /**@type {SyntaxTreeNode|undefined} */
    parent = undefined;
    uniqueId = 0;

    constructor() {
        this.uniqueId = String(uniqueNumber());
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
            return undefined;
        }
    }

    /**
     * Helper function that sets parent node
     * SHOULD be called only by its parent 
     * @param {SyntaxTreeNode|undefined} node 
     */
    setParent(node) {
        this.parent = node;
    }

    /**
     * Gets the closest (up) node that is instance of class
     * @param {Class} getClass 
     * @returns {SyntaxTreeNode|undefined}
     */
    getClassNode(getClass) {
        if (this instanceof getClass) {
            return this;            
        } else if (this.parent === undefined) {
            return undefined;
        } else {
            return this.parent.getClassNode(getClass);
        }
    }

    /**
     * Debug function 
     * @returns {Object}
     */
    toJSON() {
        const { parent, ...rest } = this;
        return rest;
    }
}