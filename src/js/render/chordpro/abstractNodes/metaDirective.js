import { SyntaxTreeNode } from "./node.js";

/**
 * Directive that does not result in node in syntax tree.
 * It only affects metadata of some other node.
 */
export class MetaDirective extends SyntaxTreeNode{
    /**@type {string} */
    static directiveName;
    /**@type {string} */
    static directiveShortcut;
    
    /**
     * Generate side effect of the directive
     * @param {string} unnamedArgument 
     * @param {string} namedArguments 
     * @param {SyntaxTreeNode} activeNode 
     */
    static generateSideEffects(unnamedArgument, namedArguments, activeNode) {
        
    }
}