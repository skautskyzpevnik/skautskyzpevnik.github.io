import { generateUID } from "./utils.js"

class DownloadManagerWorkerMsgData{
    type;
    toDownload;
    cacheName;
    callback;
}

class DownloadManager{
    #cacheDownloader;
    #port;
    #callbackArray = [];
    #errorCallbackArray = [];
    #progressCallbackArray = [];
    #callbackObjects = [];
    isWorkerShared = false;

    constructor(notSharedEror = false){
        if (window.Worker) {    
            // if(window.SharedWorker){
            //     this.#cacheDownloader = new SharedWorker("js/downloadManager/worker.js");
            //     this.#port = this.#cacheDownloader.port;
            //     this.isWorkerShared = true
            // }else
            if(!notSharedEror){
                console.warn("The downloadManager worker is not shared");
                this.#cacheDownloader = new Worker("js/downloadManager/worker.js");
                this.#port = this.#cacheDownloader;
            }else{
                throw Error("The downloadManager worker is not shared");
            }
            this.#cacheDownloader.onmessage = this.#workerCallback;
            this.#cacheDownloader.callbackArray = this.#callbackArray;
            this.#cacheDownloader.errorCallbackArray = this.#errorCallbackArray;
            this.#cacheDownloader.progressCallbackArray = this.#progressCallbackArray;
            this.#cacheDownloader.callbackObjects = this.#callbackObjects;
            console.log("downloadManager worker register");
        }else{
            console.error("Web Workers api unavalible.");
        }
    }

    #workerCallback(e){
        console.log(e);
        if(e.data.state == "done"){
            this.progressCallbackArray[e.data.callback](this.callbackObjects[e.data.callback], e.data);
        }else if(e.data.state == "failed"){
            this.errorCallbackArray[e.data.callback](this.callbackObjects[e.data.callback], e.data);
        }else{
            console.error("Unimplemented");
        }
    }
    
    /**
     * 
     * @param {string|Array} toDownload 
     * @param {string} cacheName 
     * @param {Object} data 
     * @param {Function} callback 
     * @param {Function} progressCallback 
     * @param {Function} errorCallback 
     * @returns 
     */
    downloadToCache(toDownload, cacheName, data, callback = console.log, progressCallback = console.log, errorCallback = console.error){
        if(typeof toDownload == "string"){
            toDownload = [toDownload];
        }
        let msg = new DownloadManagerWorkerMsgData();
        msg.type = "cache";
        msg.toDownload = toDownload;
        msg.cacheName = cacheName;
        
        // generate id
        let id = "";
        while(id === "" | this.#callbackArray[id] !== undefined){
            id = generateUID(10);
        }
        this.#callbackArray[id] = callback;
        this.#progressCallbackArray[id] = progressCallback;
        this.#errorCallbackArray[id] = errorCallback;
        this.#callbackObjects[id] = data;

        msg.callback = id;

        this.#port.postMessage(msg);
        return true;
    }
}

export const downloadManagerInstance = new DownloadManager();

if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then((persistent) => {
      if (persistent) {
        console.log("Storage will not be cleared except by explicit user action");
      }else{
        alert("Prohlížeč může smazat některé písničky uložené offline.");
        console.log("Storage may be cleared by the UA under storage pressure.");
      }
    });
  }
  