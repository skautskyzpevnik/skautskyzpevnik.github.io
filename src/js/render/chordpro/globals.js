export const glob = {
	contentEditable: false,
	activeAstNode: undefined
};

let unique = 0;

export function uniqueNumber() {
	return unique++;
}