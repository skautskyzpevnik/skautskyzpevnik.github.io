import { SyntaxTreeNode } from "./ast.js";
import { currentSongBook } from "../index.js";

/**
 * Gets node that is instance of class from tree (up)
 * @param {Class} classInstance 
 * @param {SyntaxTreeNode} active 
 */
export function getAbove(classInstance, active) {
    let activeNode = active;
    do {
        if (activeNode instanceof classInstance) {
            return activeNode;
        }
        activeNode = activeNode.parent;
    } while (activeNode !== undefined);
    return false;
}

/**
 * Recalculates how much of a range is inside element
 * @param {Range} range 
 * @param {HTMLElement} element 
 */
export function rangeInsideElement(range, element) {
    let container = getElementFromNode(range.commonAncestorContainer);
    var _iterator = document.createNodeIterator(
        container,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: function (node) {
                // console.log(node);
                // console.log(element);
                if (node === element) {
                    return NodeFilter.FILTER_ACCEPT;
                } else {
                    return NodeFilter.FILTER_REJECT;
                }
            }
        }
    );
    while (_iterator.referenceNode !== element && _iterator.nextNode()) { }
    /**
     * @type {HTMLElement}
     */
    let finalElement = _iterator.referenceNode;
    let result;

    if (getElementFromNode(range.startContainer) === finalElement && getElementFromNode(range.endContainer) === finalElement) {
        result = {
            "start": range.startOffset,
            "stop": range.endOffset,
            "collapse": true
        };
    } else if(getElementFromNode(range.startContainer) === finalElement){
        result = {
            "start": range.startOffset,
            "stop": finalElement.innerText.length,
            "collapse": false
        };
    } else if (getElementFromNode(range.endContainer) === finalElement) {
        result = {
            "start": 0,
            "stop": range.endOffset,
            "collapse": false
        };
    } else {
        result = {
            "start": 0,
            "stop": finalElement.innerText.length,
            "collapse": false
        };
    }
    return result;
}

/**
 * Ring buffer
 */
export class RingBuffer extends Array{
    size = 1;
    constructor(n) {
        super(n);
        this.size = n;
    }
    push(any) {
        super.push(any);
        if (this.length > this.size) {
            super.shift();
        }
    }
    unshift(any) {
        super.unshift(any);
        if (this.length > this.size) {
            super.pop();
        }
    }
}

/**
 * Gets parent element of node (or the same node if it is already element)
 * @param {Node} node 
 * @returns {HTMLElement}
 */
export function getElementFromNode(node) {
    while (node !== undefined && node.nodeType !== Node.ELEMENT_NODE) {
        node = node.parentElement;
    }
    return node;
}

/**
 * Gets parent element with specific id
 * @param {HTMLElement} element 
 * @param {String} id 
 * @returns {HTMLElement|undefined}
 */
export function getParentWithId(element, id) {
    while (element !== undefined && element !== null) {
        if (element.getAttribute("id") === id) {
            return element;
        }
        element = element.parentElement;
    }
    return undefined;
}

/**
 * Gets ast node from element
 * @param {HTMLElement} element
 * @returns {SyntaxTreeNode|undefined}
 */
export function getAstNodeFromElement(element) {
    while (element !== null && element.getAttribute("data-astid") === null) {
        element = element.parentElement;
    }
    if (element === null || currentSongBook === undefined) {
        return undefined;
    }
    return currentSongBook.getNodeById(element.getAttribute("data-astid"));
}