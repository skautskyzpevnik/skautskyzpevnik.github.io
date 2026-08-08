import { Journal } from "./journal.js";

/** global variables */
export const glob = {
	contentEditable: false,
	activeAstNode: undefined,
	journal: new Journal(),
};

let unique = 0;
/**
 * returns unique number
 * @returns {number}
 */
export function uniqueNumber() {
	return unique++;
}