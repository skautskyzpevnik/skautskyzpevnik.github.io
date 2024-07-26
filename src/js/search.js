import { extractFilenameFromURL, fetchWrapper} from "./utils.js";

class SonglistSong{
    title;
    artist;
}

class Songlist{
    #songList = [];
    #songBooks = [];
    #localSongbooks = [];
    constructor(){
    }
    /**Fills the structure with data*/
    async #prepare(){
        if (this.#songList.length == 0) {
            let list = localStorage.getItem("list");
            try {
                list = await fetchWrapper("data/list.json");
                list = await list.text();
            } catch {
                console.warn("Offline using local songlist");
            }
            localStorage.setItem("list", list);
            list = JSON.parse(list);
            let songList = list.songs;
            for(let song in songList){
                song = songList[song];
                this.#songList.push(song);
            };
            this.#syncOffline();
            await this.#offline(this.#songList);
            
            this.#songBooks = list.songbooks;
        }
        await this.#localSongbooksLoad();
    }

    /**
     * Returns list of all songbooks
     * @returns {Array} list of all songbooks
     */
    async songBooks(){
        await this.#prepare();
        let songbooks = this.#songBooks;
        for(let songbook of this.#localSongbooks){
            songbooks.push(songbook);
        }
        return songbooks;
    }

    /**
     * Returns list of local songbooks
     * @returns {Array} list of local songbooks
     */
    async localSongbooks(){
        this.#prepare();
        return this.#localSongbooks;
    }

    /** Loads local songbooks */
    #localSongbooksLoad(){
        if(window.localStorage){
            let localSongbooks = JSON.parse(window.localStorage.getItem("songbooks"));
            if(localSongbooks){
                for(let songbook of localSongbooks){
                    songbook = JSON.parse(window.localStorage.getItem(songbook));
                    if(songbook){
                        this.#localSongbooks.push(songbook);
                    }
                }
            }
        }
    }

    /**
     * Updates local songbook
     * @param {string} title 
     * @param {string} subtitle 
     * @param {Object} songs 
     */
    #updateSongbookNoChecks(title, subtitle, songs){
        let songbook = {"title":title, "subtitle":subtitle, "songs": songs};
        window.localStorage.setItem("songbook-"+title+subtitle, JSON.stringify(songbook));
    }

    /**
     * Updates local songbook
     * @param {string} title 
     * @param {string} subtitle 
     * @param {Object} songs 
     * @returns {boolean}
     */
    updateSongbook(title, subtitle, songs){
        if(window.localStorage){
            let localSongbooks = JSON.parse(window.localStorage.getItem("songbook-"+title+subtitle));
            if(localSongbooks == null){
                return false;
            }else{
                this.#updateSongbookNoChecks(title, subtitle, songs);
                return true;
            }
        }
    }

    /**
     * Adds new songbook
     * @param {string} title 
     * @param {string} subtitle 
     * @param {Object} songs 
     * @returns {boolean|undefined}
     */
    addSongbook(title, subtitle, songs){
        if(window.localStorage){
            if(window.localStorage.getItem("songbook-"+title+subtitle)){
                return false;
            }else{
                this.#updateSongbookNoChecks(title, subtitle, songs);
                let localSongbooks = JSON.parse(window.localStorage.getItem("songbooks"));
                if(localSongbooks == null){
                    localSongbooks = [];
                }
                localSongbooks.push("songbook-"+title+subtitle);
                window.localStorage.setItem("songbooks", JSON.stringify(localSongbooks));
                return true;
            }
        }else{
            return undefined;
        }
    }

    /**
     * Removes songbook
     * @param {string} title 
     * @param {string} subtitle 
     * @returns {boolean|undefined}
     */
    removeSongbook(title, subtitle){
        if(window.localStorage){
            let localSongbooks = JSON.parse(window.localStorage.getItem("songbooks"));
            if(localSongbooks == null){
                return false;
            }else{
                let index = localSongbooks.indexOf("songbook-"+title+subtitle);
                if(index != -1){
                    localSongbooks.slice(index, 1);
                }
                window.localStorage.setItem("songbooks", JSON.stringify(localSongbooks));
                window.localStorage.removeItem("songbook-"+title+subtitle);
                return true;
            }
        }else{
            return undefined;
        }
    }

    /**
     * Returns array of songs of matching functions.
     * @param {Function} testFnc if returns true song is inclueded
     * @returns {Array}
     */
    #filter(filteredSonglist, testFnc){
        const results = [];
        for(let song of filteredSonglist){
            if(testFnc(song)){
                results.push(song);
            }
        }
        return results;
    }

    /**
     * Filters songs by title
     * @param {Object} filteredSonglist 
     * @param {string} string 
     * @returns {Object}
     */
    #titleSearch(filteredSonglist, string){
        return this.#filter(filteredSonglist, function(song) {
            return song.title.toLowerCase().includes(string.toLowerCase());
        });
    }

    /**
     * Filters songs by artists
     * @param {Object} filteredSonglist 
     * @param {string} string 
     * @returns {Object}
     */
    #artistSearch(filteredSonglist, string){
        return this.#filter(filteredSonglist, function(song) {
            return song.artist.toLowerCase().includes(string.toLowerCase());
        });
    }

    /**
     * Searches all songs and returns array matching the criteria
     * @param {string} title songtitle (all if undefined)
     * @param {string} artist (all if undefined)
     * @param {boolean} offline (all if undefined)
     * @returns {Promise} Array matching songs
     */
    async search(title, artist, offline){
        await this.#prepare();
        let filteredSonglist = this.#songList;
        if(offline !== undefined){
            filteredSonglist = await this.#offline(filteredSonglist, offline);
        }
        if(title !== undefined & title !== ""){
            filteredSonglist = this.#titleSearch(filteredSonglist, title);
        }
        if(artist !== undefined & artist !== ""){
            filteredSonglist = this.#artistSearch(filteredSonglist, artist);
        }
        return filteredSonglist;
    }

    /**
     * Filters by offline avalibility of songs 
     * @param {Array} filteredSonglist 
     * @param {boolean} offline return only offline
     * @returns {Object} Array matching songs
     */
    async #offline(filteredSonglist, offline){
        let cache = await caches.open("songCache");
        let offlineSongsRequests = await cache.keys();
        let offlineSongs = [];
        for(let song of filteredSonglist){
            let songfile = song.file.split("/")[1];
            song.offline = false;
            for(let request of offlineSongsRequests){
                let requestSongFile = extractFilenameFromURL(request.url);
                if(songfile === requestSongFile){
                    song.offline = true;
                    break;
                }
            }
            if((offline & song.offline) | (!offline & !song.offline)){
                offlineSongs.push(song);
            }
        }
        return offlineSongs;
    }

    /**
     * Syncs offline saved songs with songlist
     * Helpful when updating
     */
    async #syncOffline() {
        let cache = await caches.open("songCache");
        let offlineSongsRequests = await cache.keys();
        for (let request of offlineSongsRequests) {
            let split = request.url.split("/");
            let requestSongFile = split[split.length - 2] + "%2F" + extractFilenameFromURL(request.url);
            let found = false;
            for (let song of this.#songList) {
                let encoded = encodeURIComponent(decodeURIComponent(song.file));
                if(requestSongFile == encoded){
                    found = true;
                    break;
                }
            }
            if (!found) {
                cache.delete(request);
            }
        }
    }
}

export const songList = new Songlist();