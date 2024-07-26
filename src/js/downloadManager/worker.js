/**
 * Posts message back to main thread
 * @param {MessageEvent} e 
 * @param {Object} msg 
 */
function postMessageWrapper(e, msg) {
    if(e.ports[0] === undefined){
        postMessage(msg);
    }else{
        e.ports[0].postMessage(msg);
    }
}

onmessage = async function(e){
    if(e.data.type === "cache"){
        let cache = await caches.open(e.data.cacheName);
        e.data.toDownload.forEach(async function(url){
            try{
                await cache.add(url);
                postMessageWrapper(e, {"state":"done", "callback": e.data.callback, "url": url});
            }catch (error){
                postMessageWrapper({"state":"failed", "callback": e.data.callback, "url": url});
                console.log(error);
            }
        });
    }else{
        console.error("unimplemented");
    }
}