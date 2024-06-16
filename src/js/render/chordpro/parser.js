import {tokenizer, Token, OpeningCurlyBrace, ClosingCurlyBrace, Colon, OpeningSquareBracket, ClosingSquareBracket, Asterisk, Space, Word, Dash, Newline, QuotationMarks, Equals} from "./lexer.js"
import { InternalError } from "./helper.js"
import { Soc, Sov, directiveSearch } from "./directives.js"
import { Songbook, Song, MetaDirective, DirectiveChildren, Chord, SyntaxTreeNode, Directive, Text, Line } from "./ast.js"

export class SyntaxError extends Error {
    constructor(message, lineNumber, charNumber) {
        super("Syntax error: " + message + "\n on line: " + lineNumber + " char: " + charNumber)
    }
}

/**
 * 
 * @param {Token} token 
 * @param {*} expected 
 */
function expect(token, expected) {
    if (! (token instanceof expected)) {
        throw new SyntaxError("Unexpected '" + token.constructor.name + "' expecting: " + expected.name, token.line, token.charNumber);
    }
}

function next(i, tokens) {
    return {
        "i": ++i,
        "token": tokens[i]
    }
}

function expectAndNext(i, tokens, expected) {
    expect(tokens[i], expected);
    return next(i, tokens);
}

function ignoreWhitespace(i, tokens) {
    let numberSpace = 0;
    while (i < tokens.length && tokens[i] instanceof Space ) {
        i++;
        numberSpace++;
    }
    return {
        "i": i,
        "token": tokens[i],
        "numberSpace": numberSpace
    };    
}

function exportArgument(i, tokens) {
    let token;
    let textArray = [];
    let namedArguments = {};
    // unlabeled arguments
    i--;
    do {
        i++;
        let value = "";
        while (i < tokens.length && (tokens[i] instanceof Word || tokens[i] instanceof Asterisk || tokens[i] instanceof Dash || tokens[i] instanceof Colon)) {
            value += tokens[i].innerText;
            i++;
        }
        if (value !== "") {
            textArray.push(value);    
        }
        if (tokens[i] instanceof Space) {
            textArray.push(" "); 
        }
    } while (i < tokens.length && tokens[i] instanceof Space);
    
    if (tokens[i] instanceof Equals && i > 1 && tokens[i-1] instanceof Word) {
        i++;
        let value = ""; 
        if (tokens[i] instanceof QuotationMarks) {
            i++;
            while (i < tokens.length && (tokens[i] instanceof Word || tokens[i] instanceof Space || tokens[i] instanceof Asterisk || tokens[i] instanceof Dash)) {
                value += tokens[i].innerText;
                i++;
            }
            ({ i, token } = expectAndNext(i, tokens, QuotationMarks));
        } else {
            expect(tokens[i], Word);
            value = tokens[i].innerText;
            i++;
        }
        namedArguments[textArray.pop()] = value;
        textArray.pop(); // there has to be space
    }

    let text = textArray.join("");
    return {
        "i": i,
        "token": tokens[i],
        "unnamedArgument": text,
        "namedArguments": namedArguments
    }
}

/**
 * 
 * @param {str} directiveName 
 * @param {SyntaxTreeNode} active 
 */
function getClosing(directiveName, active, warn) {
    let activeNode = active;
    do {
        if (activeNode instanceof DirectiveChildren && (activeNode.constructor.directiveClosingName === directiveName || activeNode.constructor.directiveClosingShortcut === directiveName)) {
            if (activeNode.parent === undefined && warn) {
                throw new InternalError("Broken tree")
            }
            return activeNode.parent;
        }
        activeNode = activeNode.parent;
    } while (activeNode !== undefined);
    return active;
}

/**
 * 
 * @param {Class} classInstance 
 * @param {SyntaxTreeNode} active 
 */
function getClosingFromClass(classInstance, active, warn) {
    let activeNode = active;
    do {
        if (activeNode instanceof classInstance) {
            if (activeNode.parent === undefined && warn) {
                throw new InternalError("Broken tree")
            }
            return activeNode.parent;
        }
        activeNode = activeNode.parent;
    } while (activeNode !== undefined);
    return active;
}

/**
 * 
 * @param {Class} classInstance 
 * @param {SyntaxTreeNode} active 
 */
function getAbove(classInstance, active) {
    let activeNode = active;
    do {
        if (activeNode instanceof classInstance) {
            return activeNode;
        }
        activeNode = activeNode.parent;
    } while (activeNode !== undefined);
    return false;
}

/**
 * Returns chord text
 * @param {number} i 
 * @param {Token[]} tokens 
 * @returns 
 */
function exportChord(i, tokens) {
    let text = ""
    while (!(tokens[i] instanceof ClosingSquareBracket || tokens[i] instanceof Newline || i >= tokens.length)) {
        text += tokens[i].innerText;
        i++;
    }
    return {
        "i": i,
        "token": tokens[i],
        "chord": text
    }
}

/**
 * Parse input text 
 * @param {text} text text to parse
 * @param {Songbook} songBook songbook to append the song/songs to
 * @returns {Songbook}
 */
export function parse(text, songBook = new Songbook()) {
    const tokens = tokenizer(text);
    const root = songBook;
    let activeNode = new Song();
    root.appendChild(activeNode);
    let numberSpace = 0;
    let readNewline = true;
    let lastNewlineLine = 0;
    let lastNewlineChar = 0;
    let lastVerseIndex = 1;
    let automaticSov = false;
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (token instanceof Space) {
            numberSpace += 1;
        } else {
            const prependedSpaces = numberSpace;
            numberSpace = 0;
            let line = token.line;
            let charNumber = token.charNumber;
            if (token instanceof OpeningCurlyBrace) {
                readNewline = false;
                if (automaticSov) {
                    activeNode = getClosingFromClass(Soc, activeNode, false);
                    activeNode = getClosingFromClass(Sov, activeNode, false);
                }
                //directive
                ({ i, token } = next(i, tokens));
                ({ i, token, numberSpace } = ignoreWhitespace(i, tokens));
                expect(token, Word);
                let directiveName = token.innerText;
                let selector = "";
                let unnamedArgument = "";
                let namedArguments = {};
                ({ i, token } = next(i, tokens));
                if (token instanceof Dash) {
                    //has selector
                    ({ i, token } = next(i, tokens));
                    expect(token, Word);
                    selector = token.innerText;
                    ({ i, token } = next(i, tokens));
                }
                if (token instanceof Colon) {
                    ({ i, token } = next(i, tokens));
                    ({ i, token, numberSpace } = ignoreWhitespace(i, tokens));
                    ({ i, token, unnamedArgument, namedArguments } = exportArgument(i, tokens));
                }
                expect(token, ClosingCurlyBrace);
                
                // parse Directive
                
                let directive = directiveSearch(directiveName);
                if (directive === undefined) {
                    let newActiveNode = getClosing(directiveName, activeNode, true);
                    if (newActiveNode === activeNode) {
                        console.warn("Unknown directive: '" + directiveName + "'\n on line: " + line + " char: " + charNumber);
                    }
                    activeNode = newActiveNode;
                } else {
                    if (directive.prototype instanceof DirectiveChildren) {
                        let instance = new directive(line, charNumber, unnamedArgument, namedArguments);
                        activeNode.appendChild(instance);
                        activeNode = instance;
                        automaticSov = directive.automaticSov;
                    } else if (directive.prototype instanceof MetaDirective) {
                        directive.generateSideEffects(unnamedArgument, namedArguments, activeNode);
                    } else if (directive.prototype instanceof Directive) {
                        activeNode.appendChild(new directive(line, charNumber, unnamedArgument, namedArguments));
                    } else {
                        throw new InternalError("We should not be there");
                    }
                }
            } else if (token instanceof OpeningSquareBracket) {
                if (getAbove(Soc, activeNode) === false && getAbove(Sov, activeNode) == false) {
                    let instance = new Sov(lastNewlineLine, lastNewlineChar);
                    activeNode.appendChild(instance);
                    activeNode = instance;
                    activeNode.name = lastVerseIndex;
                    lastVerseIndex++;
                    automaticSov = true;
                }
                if (readNewline) {
                    let instance = new Line(lastNewlineLine, lastNewlineChar);
                    activeNode.appendChild(instance);
                    activeNode = instance;
                }
                readNewline = false;
                //chord
                ({ i, token } = next(i, tokens));
                ({ i, token, numberSpace } = ignoreWhitespace(i, tokens));
                let chord = "";
                ({ i, token, chord } = exportChord(i, tokens));
                expect(token, ClosingSquareBracket);
                activeNode.appendChild(new Chord(line, charNumber, chord));
            } else if (token instanceof Newline) {
                lastNewlineChar = token.charNumber;
                lastNewlineLine = token.line;
                activeNode = getClosingFromClass(Line, activeNode, false);
                if (readNewline && automaticSov) {
                    activeNode = getClosingFromClass(Soc, activeNode, false);
                    activeNode = getClosingFromClass(Sov, activeNode, false);
                    automaticSov = true;
                }
                readNewline = true;
            } else {
                if (getAbove(Soc, activeNode) === false && getAbove(Sov, activeNode) == false) {
                    let instance = new Sov(lastNewlineLine, lastNewlineChar);
                    activeNode.appendChild(instance);
                    activeNode = instance;
                    activeNode.name = lastVerseIndex;
                    lastVerseIndex++;
                    automaticSov = true;
                }
                let value = "";
                if (readNewline) {
                    let instance = new Line(lastNewlineLine, lastNewlineChar);
                    activeNode.appendChild(instance);
                    activeNode = instance;
                } else {
                    value = " ".repeat(prependedSpaces);
                }
                readNewline = false;
                // text
                
                for (; i < tokens.length && !(tokens[i] instanceof Newline || tokens[i] instanceof OpeningSquareBracket || tokens[i] instanceof OpeningCurlyBrace); i++) {
                    value += tokens[i].innerText;
                }
                if (value !== "") {
                    activeNode.appendChild(new Text(line, charNumber, value));
                }
                if (tokens[i] instanceof Newline || tokens[i] instanceof OpeningSquareBracket || tokens[i] instanceof OpeningCurlyBrace) {
                    i--;   
                }
            }
        }
    }

    return root;
}