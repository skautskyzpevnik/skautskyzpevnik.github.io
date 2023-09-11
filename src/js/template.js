/*@licstart  The following is the entire license notice for the 
JavaScript code in this page.

Copyright (C) 2022 Vojtech Varecha

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

@licend  The above is the entire license notice
for the JavaScript code in this page.
*/
const prefix = getPrefix();

/**
 * extracts prefix for urls from meta tags
 * @returns {string} prefix
 */
function getPrefix(){
  let prefix_element = document.getElementById("data-prefix");
  if(prefix_element !== null){
    let data_prefix = prefix_element.getAttribute("data-prefix");
    if(typeof prefix_element !== 'undefined'){
      return data_prefix;
    }else{
      return "";
    }
  }else{
    return "";
  }
}

//include all required scripts
include(["js/utils.js","js/bg.js", "js/settings.js"]);
add_css(["css/style.css"]);
add_manifest("manifest.webmanifest");
add_favicon("favicon.ico");

/**
 * function to create script element
 * @param {string} url url of js file
 * @returns {HTMLLinkElement}
 */
function add_js(url){
  const script = document.createElement("script");
  script.setAttribute("src", url);
  script.setAttribute("type", "module");
  return script;
}

/**
 *  function to add scripts to all pages
 * @param {Array} scripts array of scripts to include
 */
function include(scripts){
  scripts.forEach(element => {
    document.head.appendChild(add_js(prefix + element));
  });
}

/**
 *  function to add css to all pages
 * @param {Array} css array of css to include
 */
function add_css(css){
  css.forEach(element => {
    document.head.appendChild(create_linktag(prefix + element, "stylesheet"));
  });
}

/**
 *  function to add manifest to all pages
 * @param {string} manifest relative url of manifest to include
 */
function add_manifest(manifest){
  document.head.appendChild(create_linktag(prefix + manifest, "manifest"));
}

/**
 *  function to add favicon to all pages
 * @param {string} favicon relative url of favicon to include
 */
function add_favicon(favicon){
  document.head.appendChild(create_linktag(prefix + favicon, "shortcut icon"));
}

/**
 *  function to set the right nav entry
 * @param {HTMLNavElement} nav nav, where entry is
 */
function set_active(nav){
  let path = window.location.pathname;
  let page = path.split("/").pop();
  if(page == ""){
    page = "index.html";
  }else if(page == "account.html"){
    page = "login.html";
  }
  let active = nav.querySelector('[href="' + page + '"]');
  if(active != null){
    active.setAttribute("class", "active");
  }
}

/**
 * function that cretes navigation bar
 */
async function build_nav(){
    res = await fetch(prefix + "include/nav.html");
    res = await res.text()
    const nav = document.createElement("nav");
    if(prefix != ""){
        res = res.replace(/href=\"/gm, "href=\""+prefix)
    }
    nav.innerHTML = res;  //this should be save while it is managed by server - independently on user input
    set_active(nav);
    document.body.insertBefore(nav, document.body.firstElementChild);
}

/**
 * function that cretes footer
 */
async function build_foo(){
    res = await fetch(prefix + "include/footer.html");
    res = await res.text()
    const foo = document.createElement("footer");
    foo.innerHTML = res;
    document.body.appendChild(foo);
}

/**
 * function, that creates link tag to link css to page
 * @param {string} url 
 * @returns {HTMLLinkElement}
 */
function create_linktag(url, rel){
  const link = document.createElement("link");
  link.setAttribute("rel", rel);
  link.setAttribute("href", url);
  return link;
}


// lets install service worker
async function registerServiceWorker() {
  if('serviceWorker' in navigator) {
    const url = "sw.js";
    const registration = await navigator.serviceWorker.register(url);
    if (registration.installing) {
      console.log("Service worker installing");
    } else if (registration.waiting) {
      console.log("Service worker installed");
    } else if (registration.active) {
      console.log("Service worker active");
    }
  }else{
    console.error("Service Worker API unavailable");
  }
}

build_nav();
build_foo();
registerServiceWorker();