import { glob } from "./chordpro/globals.js";
import { getAstNodeFromElement, getElementFromNode, getParentWithId, RingBuffer } from "./chordpro/utils.js";
import { currentSongBook } from "./index.js";
import { lonelySongFromUrl } from "./index.js";
import { Text } from "./chordpro/ast.js";

const toolbar = document.getElementById("toolbar");

/**
 * Sets button to active or inactive
 * @param {htmlElement} htmlElement 
 * @param {boolean} active 
 */
function show(htmlElement, active) {
    if (active) {
        htmlElement.classList.add("active");
    } else {
        htmlElement.classList.remove("active");
    }
}

/**
 * Switches ability to edit text
 * @param {Event} event 
 */
function edit(event) {
    glob.contentEditable = !glob.contentEditable;
    show(editButton, glob.contentEditable);
}
/**
 * Saves current songbook
 * @param {Event} event 
 */
function save(event) {
    if (currentSongBook !== undefined) {
        let filename = "song";
        if (currentSongBook.filename !== undefined) {
            filename = currentSongBook.filename;
        } else if (currentSongBook.children[0] !== undefined && currentSongBook.children[0].filename !== undefined) {
            filename = currentSongBook.children[0].filename;
        }
        download(filename + ".chordpro", currentSongBook.chordpro)
    }
}
/**
 * Opens new file
 * @param {Event} event 
 */
function open(event) {
    let file = event.target.files[0];
    document.getElementById("rendering-target").innerHTML = "";
    lonelySongFromUrl(URL.createObjectURL(file), file.name);
}
/**
 * Adds new chord
 * @param {Event} event 
 */
function chord(event) {
    resetRange(ranges);
    let container = getElementFromNode(ranges.commonAncestorContainer);
    let _iterator = document.createNodeIterator(
        container,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: function (node) {
                if (node.children.length === 0) {
                    return NodeFilter.FILTER_ACCEPT;
                } else {
                    return NodeFilter.FILTER_REJECT;
                }
            }
        }
    );
    /**@type {HTMLElement[]}*/
    let selection = [];
    while (_iterator.nextNode()) {
        selection.push(_iterator.referenceNode);
    }
    for (const element of selection) {
        let node = getAstNodeFromElement(element);
        if (node !== undefined && node instanceof Text) {
            node.chord();
        }
    }
}

const editButton = document.getElementById("edit");
editButton.addEventListener("click", edit);
show(editButton, glob.contentEditable);

const printButton = document.getElementById("print");
printButton.addEventListener("click", (event) => {
    print();
});

const saveButton = document.getElementById("save");
saveButton.addEventListener("click", save);

const openButton = document.getElementById('fileInput');
openButton.addEventListener('change', open);

const chordButton = document.getElementById("chord");
chordButton.addEventListener('click', chord);

const pressedKeys = {
    ctrl: false,
    alt: false
}

window.addEventListener('keydown', function (e) {
    if (e.defaultPrevented) {
        return;
    }

    switch (e.code) {
        case "ControlRight":
        case "ControlLeft":
            e.preventDefault();
            pressedKeys.ctrl = true;
            break;
        case "AltLeft":
        case "AltRight":
            pressedKeys.alt = true;
            break;
        case "KeyS":
            if (pressedKeys.ctrl) {
                save(e)
                e.preventDefault();
                pressedKeys.ctrl = false;
                pressedKeys.alt = false;
            }
            break;
        case "KeyP":
            if (pressedKeys.ctrl) {
                this.print();
                e.preventDefault();
                pressedKeys.ctrl = false;
                pressedKeys.alt = false;
            }
            break;
        case "KeyO":
            if (pressedKeys.ctrl) {
                this.document.getElementById("fileInput").click();
                e.preventDefault();
                pressedKeys.ctrl = false;
                pressedKeys.alt = false;
            }
            break;
        case "KeyE":
            if (pressedKeys.ctrl) {
                edit(e)
                e.preventDefault();
                pressedKeys.ctrl = false;
                pressedKeys.alt = false;
            }
            break;
        case "KeyC":
            if (pressedKeys.alt) {
                chord(e);
                e.preventDefault();
                pressedKeys.ctrl = false;
                pressedKeys.alt = false;
            }
            break;
    }
});

window.addEventListener('keyup', function (e) {
    if (e.defaultPrevented) {
        return;
    }

    switch (e.code) {
        case "ControlRight":
        case "ControlLeft":
            e.preventDefault();
            pressedKeys.ctrl = false;
            break;
        case "AltLeft":
        case "AltRight":
            pressedKeys.alt = false;
            break;
    }
});
/**
 * Downloads string as file
 * @param {string} filename 
 * @param {string} text 
 */
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}
/**@type {Range} */
let ranges = undefined;
const activeElements = new RingBuffer(2);

toolbar.addEventListener("customselectionchange", (event) => {
    event.stopPropagation();
});

document.addEventListener("customselectionchange", (event) => {
    activeElements.push(document.activeElement);
    ranges = window.getSelection().getRangeAt(0);
});
/**
 * Sets active range
 * @param {Range} range 
 */
function resetRange(range) {
    if (range !== undefined) {
        const select = window.getSelection();
        select.addRange(range);
    }
}