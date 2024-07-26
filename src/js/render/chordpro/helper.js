/**
 * Class representing internal error of parser
 */
export class InternalError extends Error {
    constructor(message) {
        super("Internal error: " + message)
    }
}
