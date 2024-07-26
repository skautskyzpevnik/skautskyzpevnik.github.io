/** global variables */
export const glob = {
	contentEditable: false,
	activeAstNode: undefined
};

let unique = 0;
/**
 * returns unique number
 * @returns {number}
 */
export function uniqueNumber() {
	return unique++;
}