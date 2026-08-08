import { SyntaxTreeNodeWithChildren } from "./nodeWithChildren.js";

/**
 * Abstract class representing Directive that has children ast node
 */
export class DirectiveChildren extends SyntaxTreeNodeWithChildren{
    /**@type {string} */
    static directiveName;
    /**@type {string} */
    static directiveShortcut;
    /**@type {string} */
    static directiveClosingName;
    /**@type {string} */
    static directiveClosingShortcut;
    static automaticSov = true;
    
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