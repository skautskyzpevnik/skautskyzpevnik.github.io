import { MetaDirective } from "../abstractNodes/metaDirective.js"
import { Song } from "../nodes/song.js"
/**@import {SyntaxTreeNode} from "../abstractNodes/node.js" */

/**
 * Class implementing Artist meta directive
 */
export class Artist extends MetaDirective {
    static directiveName = "artist";
    static directiveShortcut = undefined;
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
            songNode.artist = unnamedArgument;
        }
    }
}