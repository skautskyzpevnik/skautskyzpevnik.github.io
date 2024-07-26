import { settings, reset_settings, save_settings } from "./settings.js";
import { fetchWrapper } from "./utils.js";

const p_template = document.createElement("p");
const p_key = p_template.cloneNode(1);
p_key.setAttribute("class", "key");
const div_row_template = document.createElement("div");
div_row_template.setAttribute("class", "settingsrow");
div_row_template.appendChild(p_key);
const input_template = document.createElement("input"); 
const button_template = document.createElement("button");
button_template.setAttribute("class", "setButton")
button_template.innerText = "set"; 
let id = 0;

renderSettings();

/**
 * Render Settings ui
 */
async function renderSettings(){
    document.getElementById("reset").addEventListener("click", function(){reset_settings(); location.reload()});
    let translation = await fetchWrapper(prefix + "settings/translation.json");
    translation = await translation.json();
    create_editfields(settings,document.getElementById("settings"), translation)
}

/**
 * Recursively creates ui field for settings editing
 * @param {Object} object 
 * @param {HTMLElement} parent 
 * @param {Object} translation 
 */
function create_editfields(object, parent, translation){
    for(let key in object){
        let id_copy = id;
        let key_copy = key;
        let div = div_row_template.cloneNode(1);
        let value = object[key];
        let name = key;
        if(translation[key] != undefined){
            name = translation[key];
        }

        div.getElementsByClassName("key")[0].innerText = name + ": ";
        switch(typeof object[key]){
            case 'bigint':
                {
                    let input = input_template.cloneNode(1);
                    input.setAttribute("type", "number");
                    input.setAttribute("value", value);
                    input.setAttribute("id", id);
                    let button = button_template.cloneNode(1);
                    button.addEventListener("click", function(){
                        edit(object, key_copy, id_copy);
                    });
                    div.appendChild(input);
                    div.appendChild(button);
                    id++;
                }
                break;
            case 'boolean':
                {
                    let input = input_template.cloneNode(1);
                    input.setAttribute("type", "checkbox");
                    input.checked = value;
                    input.setAttribute("id", id);
                    input.addEventListener("click", function(){
                        edit(object, key_copy, id_copy);
                    });
                    div.appendChild(input);
                    id++;
                }
                break;
            case 'number':
                {
                    let input = input_template.cloneNode(1);
                    input.setAttribute("type", "number");
                    input.setAttribute("value", value);
                    input.setAttribute("id", id);
                    let button = button_template.cloneNode(1);
                    button.addEventListener("click", function(){
                        edit(object, key_copy, id_copy)
                    });
                    div.appendChild(input);
                    div.appendChild(button);
                    id++;
                }
                break;
            case 'object':
                create_editfields(object[key], div, translation);
                break;
            case 'string':
                {
                    let input = input_template.cloneNode(1);
                    input.setAttribute("type", "text");
                    input.setAttribute("value", value);
                    input.setAttribute("id", id);
                    let button = button_template.cloneNode(1);
                    button.addEventListener("click", function(){
                        edit(object, key_copy, id_copy)
                    });
                    div.appendChild(input);
                    div.appendChild(button);
                    id++;
                }
                break;
            case 'symbol':
                {
                    let input = input_template.cloneNode(1);
                    input.setAttribute("type", "text");
                    input.setAttribute("value", value);
                    input.setAttribute("id", id);
                    let button = button_template.cloneNode(1);
                    button.addEventListener("click", function(){
                        edit(object, key_copy, id_copy)
                    });
                    div.appendChild(input);
                    div.appendChild(button);
                    id++;
                }
                break;
            case 'undefined':
                {
                    let input = input_template.cloneNode(1);
                    input.setAttribute("type", "text");
                    input.setAttribute("value", "undefined");
                    input.setAttribute("id", id);
                    let button = button_template.cloneNode(1);
                    button.addEventListener("click", function(){
                        edit(object, key_copy, id_copy)
                    });
                    div.appendChild(input);
                    div.appendChild(button);
                    id++;
                }
            default:
                console.error("typeof object[" + key + "]: " + typeof object[key])
                break;
        }
        parent.appendChild(div);
    }
}

/**
 * Edits settings
 * @param {Object} object 
 * @param {string} key 
 * @param {string} id 
 */
function edit(object, key, id){
    if(document.getElementById(id).getAttribute("type") == "checkbox"){
        object[key] = Boolean(document.getElementById(id).checked);
    }else{
        object[key] = document.getElementById(id).value;
    }
    save_settings();
}