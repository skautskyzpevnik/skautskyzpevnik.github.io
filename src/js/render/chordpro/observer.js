class Prop {
    constructor(value) {
        this.value = value;
    }
    value = undefined;
    callbacks = [];
} 

/**
 * 
 * @param {Object} obj 
 * @param {String} propName 
 * @param {Function} callback 
 */
export function watch(obj, propName, callback) {
    if (obj._hidden === undefined) {
        obj._hidden = [];   
    } else if (!Array.isArray(obj._hidden)){
        console.warn("Removing data");
    }
    if (obj._hidden[propName] === undefined) {
        obj._hidden[propName] = new Prop(obj[propName]);   
    }
    obj._hidden[propName].callbacks.push(callback);
    Object.defineProperty(obj, propName, {
        get() {
          return obj._hidden[propName].value;
        },
        set(newValue) {
          if (newValue !== obj._hidden[propName]) {
            const oldValue = obj._hidden[propName].value;
            obj._hidden[propName].value = newValue;
            for (const callback of obj._hidden[propName].callbacks) {
                callback(newValue, oldValue);
            }
          }
        },
    });
}

export function linkProperties(obj1, propName1, obj2, propName2) {
    obj2[propName2] = obj1[propName1];
    watch(obj1, propName1, (newValue, oldValue) => {
        obj2[propName2] = newValue;
    });
}

/**
 * 
 * @param {Object} obj1 
 * @param {String} propName1 
 * @param {HTMLElement} htmlNode 
 * @param {string} attributeName 
 */
export function linkToHtmlAttribute(obj1, propName1, htmlNode, attributeName) {
    htmlNode.setAttribute(attributeName, obj1[propName1]);
    watch(obj1, propName1, (newValue, oldValue) => {
        htmlNode.setAttribute(attributeName, newValue);
    });
}