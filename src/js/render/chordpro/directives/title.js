import { MetaDirective } from "../abstractNodes/metaDirective.js"
import { Song } from "../nodes/song.js"

/**@import {SyntaxTreeNode} from "../abstractNodes/node.js" */


/**
 * Class implementing Title meta directive
 */
export class Title extends MetaDirective {
    static directiveName = "title";
    static directiveShortcut = "t";
    /**
     * Generate side effect of the directive
     * @param {string} unnamedArgument 
     * @param {Array} namedArguments 
     * @param {SyntaxTreeNode} activeNode 
     */
    static generateSideEffects(unnamedArgument, namedArguments, activeNode) {
        let songNode = activeNode.getClassNode(Song);
        if (songNode === undefined) {
            console.warn("Song not found.");
        } else {
            songNode.title = unnamedArgument;
        }
    }
}