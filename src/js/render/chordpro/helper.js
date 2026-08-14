const toReplace = [
    {
        "from": /\\/g,
        "to": "\\\\"
    },
    {
        "from": /#/g,
        "to": "\\#"
    },
    {
        "from": /\$/g,
        "to": "\\$"
    },
    {
        "from": /\{/g,
        "to": "\\{"
    },
    {
        "from": /\}/g,
        "to": "\\}"
    },
    {
        "from": /~/g,
        "to": "\\string~"
    },
    {
        "from": /&/g,
        "to": "\\&"
    },
    {
        "from": /_/g,
        "to": "\\_"
    },
    {
        "from": /%/g,
        "to": "\\%"
    },
    {
        "from": /\^/g,
        "to": "\\^"
    },
];

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

    for (const todo of toReplace) {
        str = str.replace(todo["from"], todo["to"]);
    }

    return str;
}