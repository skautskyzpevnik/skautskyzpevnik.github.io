export function extractFilenameFromURL(url){
    let filename = url.split("/");
    filename = filename[filename.length-1].split("#")[0].split("?")[0];
    filename = filename.split('.').slice(0, -1).join('.');
    if(filename == ""){
        filename = "index";
    }
    return filename;
}

/**
 * 
 * @param {HTMLElement} node 
 * @param {*} cssClass 
 * @returns 
 */
export function getParentByClass(node, cssClass){
    let returnNode = undefined;
    while(node.parentElement !== undefined & returnNode === undefined){
        if(Array.from(node.classList).includes(cssClass)){
            returnNode = node;
        }
        node = node.parentElement;
    }
    return returnNode;
}

export async function fetchWrapper(url) {
    let result = await fetch(url);
    if (!result.ok || result.status != 200) {
        console.error("Fetch responded with:");
        console.error(result);
        throw new Error("fetch error");
    }
    return result;
}