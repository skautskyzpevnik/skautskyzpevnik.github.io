const toReplaceTex = [
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

const toReplaceFile = [
    {
        "from": /\\/g,
        "to": "-"
    },
    {
        "from": /#/g,
        "to": "-"
    },
    {
        "from": /\$/g,
        "to": "-"
    },
    {
        "from": /\{/g,
        "to": "-"
    },
    {
        "from": /\}/g,
        "to": "-"
    },
    {
        "from": /~/g,
        "to": "-"
    },
    {
        "from": /&/g,
        "to": "-"
    },
    {
        "from": /_/g,
        "to": "-"
    },
    {
        "from": /%/g,
        "to": "-"
    },
    {
        "from": /\^/g,
        "to": "-"
    },
    {
        "from": /\s/g,
        "to": "-"
    },
    {
        "from": /\//g,
        "to": "-"
    },
    {
        "from": /\?/g,
        "to": "-"
    }
];

function toAscii(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

console.log(toAscii("Příliš žluťoučký kůň"));
// "Prilis zlutoucky kun"

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

    for (const todo of toReplaceTex) {
        str = str.replace(todo["from"], todo["to"]);
    }

    return str;
}

/**
 * Function that sanitizes input for tex
 * @param {string} str 
 */
export function sanitizeFile(str) {
    if (typeof str !== "string") {
        console.log("uh oh")
    }

    for (const todo of toReplaceFile) {
        str = str.replace(todo["from"], todo["to"]);
    }

    return toAscii(str);
}