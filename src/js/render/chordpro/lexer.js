/**
 * Class representing lexical error in parser
 */
export class LexicalError extends Error {
    constructor(message, lineNumber, charNumber) {
        super("Lexical error: " + message + "\n on line " + lineNumber + "char: " + charNumber)
    }
}

/**
 * Class representing lexical token
 */
export class Token{
    line = 0;
    charNumber = 0;
    constructor(line, charNumber) {
        this.line = line;
        this.charNumber = charNumber;
    }
    innerText = "";
    static name = "token";
}
/**
 * Class representing OpeningCurlyBrace token
 */
export class OpeningCurlyBrace extends Token { 
    innerText = "{";
    static name = "{";
};
/**
 * Class representing ClosingCurlyBrace token
 */
export class ClosingCurlyBrace extends Token {
    innerText = "}";
    static name = "}";
};
/**
 * Class representing Colon token
 */
export class Colon extends Token {
    innerText = ":";
    static name = ":";
};
/**
 * Class representing OpeningSquareBracket token
 */
export class OpeningSquareBracket extends Token {
    innerText = "[";
    static name = "[";
};
/**
 * Class representing ClosingSquareBracket token
 */
export class ClosingSquareBracket extends Token {
    innerText = "]";
    static name = "]";
};
/**
 * Class representing Newline token
 */
export class Newline extends Token {
    innerText = "\n";
    static name = "newline";
};
/**
 * Class representing Asterisk token
 */
export class Asterisk extends Token {
    innerText = "*";
    static name = "*";
};
/**
 * Class representing Dash token
 */
export class Dash extends Token {
    innerText = "-";
    static name = "-";
};
/**
 * Class representing QuotationMarks token
 */
export class QuotationMarks extends Token {
    innerText = "\"";
    static name = "\"";
};
/**
 * Class representing Equals token
 */
export class Equals extends Token {
    innerText = "=";
    static name = "=";
};
/**
 * Class representing Space token
 */
export class Space extends Token {
    innerText = " ";
    static name = "space";
};
/**
 * Class representing Word token
 */
export class Word extends Token {
    static name = "word";
    constructor(innerText = "", lineNumber, charNumber) {
        super(lineNumber, charNumber);
        this.innerText = innerText;
    }
};

const notWord = ["{", "}", ":", "[", "]", "-", "*", "\n", " ", "\"", "="];

/**
 * Tokenize input text 
 * @param {text} text
 * @returns {Token[]}
 */
export function tokenizer(text){
    const tokens = [];
    let lineNumber = 1;
    let charNumber = 1;
    let lastNonWhitespaceAfterNewline = undefined;
    for (let i = 0; i < text.length; i++, charNumber++) {
        let char = text[i];
        if (char === "{") {
            lastNonWhitespaceAfterNewline = "{";
            tokens.push(new OpeningCurlyBrace(lineNumber, charNumber));
        } else if (char === '}') {
            lastNonWhitespaceAfterNewline = "}";
            tokens.push(new ClosingCurlyBrace(lineNumber, charNumber));
        } else if (char === ':') {
            lastNonWhitespaceAfterNewline = ":";
            tokens.push(new Colon(lineNumber, charNumber));
        } else if (char === '[') {
            lastNonWhitespaceAfterNewline = "[";
            tokens.push(new OpeningSquareBracket(lineNumber, charNumber));
        } else if (char === ']') {
            lastNonWhitespaceAfterNewline = "]";
            tokens.push(new ClosingSquareBracket(lineNumber, charNumber));
        } else if (char === '=') {
            lastNonWhitespaceAfterNewline = "=";
            tokens.push(new Equals(lineNumber, charNumber));
        } else if (char === '\n') {
            lastNonWhitespaceAfterNewline = undefined;
            tokens.push(new Newline(lineNumber, charNumber));
            charNumber = 0;
            lineNumber++;
        } else if (char === ' ') {
            tokens.push(new Space(lineNumber, charNumber));
        } else if (char === '*') {
            lastNonWhitespaceAfterNewline = "*";
            tokens.push(new Asterisk(lineNumber, charNumber));
        } else if (char === '-') {
            lastNonWhitespaceAfterNewline = "-";
            tokens.push(new Dash(lineNumber, charNumber));
        } else if (char === '\"') {
            lastNonWhitespaceAfterNewline = "\"";
            tokens.push(new QuotationMarks(lineNumber, charNumber));
        } else if (char === '#' && lastNonWhitespaceAfterNewline === undefined) {
            while (i < text.length && text[i] != "\n") {
                i++;
                charNumber++;
            }
        } else {
            lastNonWhitespaceAfterNewline = "c"
            let buffer = "";
            let startingCharNumber = charNumber;
            for (; i < text.length; i++, charNumber++) {
                let char = text[i];
                if (notWord.includes(char)) {
                    tokens.push(new Word(buffer, lineNumber, startingCharNumber));
                    i--;
                    charNumber--;
                    break;
                } else if( char === "\\"){
                    if (i + 1 > text.length) {
                        throw new LexicalError("Nothing after \\", lineNumber, charNumber);
                    } else {
                        buffer += text[i+1]
                        i++;
                        charNumber++;
                    }
                } else {
                    buffer += char;
                }
            }
        }
    }
    return tokens;
}