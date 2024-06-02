import { extractFilenameFromURL } from "./utils.js";

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
    async #prepare(){
        if(this.#songList.length == 0){
            let list = await fetch("data/list.json");
            list = await list.json();
            let songList = list.songs;
            for(let song in songList){
                song = songList[song];
                this.#songList.push(song);
            };
            await this.#offline(this.#songList);
            
            this.#songBooks = list.songbooks;
        }
        await this.#localSongbooksLoad();
    }

    async songBooks(){
        await this.#prepare();
        let songbooks = this.#songBooks;
        for(let songbook of this.#localSongbooks){
            songbooks.push(songbook);
        }
        return songbooks;
    }

    async localSongbooks(){
        this.#prepare();
        return this.#localSongbooks;
    }

    #localSongbooksLoad(){
        if(window.localStorage){
            let localSongbooks = JSON.parse(window.localStorage.getItem("songbooks"));
            if(localSongbooks){
                for(let songbook of localSongbooks){
                    songbook = JSON.parse(window.localStorage.getItem(songbook));
                    if(songbook){
                        this.localSongbooks.push(songbook);
                    }
                }
            }
        }
    }

    #updateSongbookNoChecks(title, subtitle, songs){
        let songbook = {"title":title, "subtitle":subtitle, "songs": songs};
        window.localStorage.setItem("songbook-"+title+subtitle, JSON.stringify(songbook));
    }

    updateSongbook(title, subtitle, songs){
        if(window.localStorage){
            let localSongbooks = JSON.parse(window.localStorage.getItem("songbook-"+title+subtitle));
            if(localSongbooks == null){
                return false;
            }else{
                this.#updateSongbookNoChecks(title, subtitle, songs);
            }
        }
    }

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

    #titleSearch(filteredSonglist, string){
        return this.#filter(filteredSonglist, function(song) {
            return song.title.toLowerCase().includes(string.toLowerCase());
        });
    }

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
     * @returns {Promise} Array matching songs
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
}

export const songList = new Songlist();