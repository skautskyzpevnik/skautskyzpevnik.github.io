const alphabet = [];

for(let i =  "a".charCodeAt(0); i< "z".charCodeAt(0)+1; i++){
    alphabet.push(String.fromCharCode(i));
}

/**
 * Generates unique id
 * @param {number} length 
 * @returns {string}
 */
export function generateUID(length){
    let id = ""
    for (let i = 0; i < length; i++) {
        let number = Math.floor(Math.random() * (alphabet.length * 2 + 10));
        if (number >= 10) {
            number -= 10;
            if (number > (alphabet.length - 1)) {
                id += alphabet[number - alphabet.length].toUpperCase(); //this is actualy right number can be 26 - 51
            } else {
                id += alphabet[number];
            }
        } else {
            id += String(number);
        }
    }
    return id;
}