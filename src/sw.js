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

const swSettings = {
    "verison": 0.3,
    "ExpectedCacheVersion": 0.3,
    "cacheName": "zpevnik",
    "cacheFile": "settings/client.json" 
}

/**
 * this function remove things from cache
 * @param {Cache} cache 
 * @param {Array} toremove 
 */
async function removeFromCache(cache, toremove){
    for(let x in toremove){
        await cache.delete(toremove[x].url);
    }
}

/**
 * this function inserts things to cache
 * @param {Array} toinsert array of things to insert
 */
async function insertToCache(cache, toinsert){

    // Join the parts back together to form the updated URL
    for(let x in toinsert){
        try{
            await cache.add(toinsert[x]);
        }catch{
            console.error("Unable to add file to cache. File: " + toinsert[x])
        }
    }
}

async function getCacheKeys(){
    let cache = await caches.open(swSettings.cacheName);
    let keys = await cache.keys();
    return keys;
}

/**
 * delete all keys from selected cache
 * @param {Cache} cache cache to delete all keys from
 */
async function cleanCache(cache){
    let keys = await cache.keys();
    for(x in keys){
        cache.delete(keys[x])
    }
}

/**
 * 
 * @param {Object} clientjson object, that represents what should be in cache (see client.json)
 * @param {Cache} cache cache to put all records in
 */
async function redownloadfull(clientjson, cache){
    await cleanCache(cache);
        await insertToCache(cache, clientjson.resources);
}

async function updateCache(){
    try {
        let cache = await caches.open(swSettings.cacheName);
    
        let req = new Request(swSettings.cacheFile);
        let res  = await fetch(req);
        let json = await res.json();
        await redownloadfull(json, cache);
    } catch (error) {
        console.error(error);
    }
}

self.addEventListener("install", event => {
    // console.log("Installing Service Worker")
    event.waitUntil(updateCache());
});

self.addEventListener('fetch', async function(event){
    let url = new URL(event.request.url);
    url.search = '';
    url.fragment = '';

    let cleanRequest = new Request(url);

    event.respondWith(
        caches.match(cleanRequest).then((response) => {
            return response || fetch(event.request);
        })
    );
});