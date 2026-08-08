import { SyntaxTreeNode } from "./node.js";

/**
 * Abstract class representing Directive ast node
 */
export class Directive extends SyntaxTreeNode{
    /**@type {string} */
    static directiveName;
    /**@type {string} */
    static directiveShortcut;
    
    line = 0;
    charNumber = 0
    /**
     * 
     * @param {number} line line in source 
     * @param {number} charNumber charnumber in line in source
     * @param {string} unnamedArgument unnamed argument
     * @param {string[]} namedArguments list of named arguments
     */
    constructor(line, charNumber, unnamedArgument, namedArguments) {
        super();
        this.line = line;
        this.charNumber = charNumber;
    }
}