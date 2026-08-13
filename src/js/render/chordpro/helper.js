/**
 * Class representing internal error of parser
 */
export class InternalError extends Error {
    constructor(message) {
        super("Internal error: " + message)
    }
}

/**
 * Function that sanitizes input for tex
 * @param {string} str 
 */
export function sanitizeTex(str) {
    if (typeof str !== "string") {
        console.log("uh oh")
    }
    return str.replace(/\\/g, "\\\\").replace(/#/g, "\\#").replace(/&/g, "\\&").replace(/_/g, "\\_");
}