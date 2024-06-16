export class InternalError extends Error {
    constructor(message) {
        super("Internal error: " + message)
    }
}
