class SonglistSong{
    title;
    artist;
}

class Songlist{
    #songList = [];
    constructor(){
    }
    async prepare(){
        if(this.#songList.length == 0){
            let list = await fetch("data/list.json");
            let songList = await list.json();
            for(let song in songList){
                song = songList[song];
                this.#songList.push(song);
            };
            await this.#offline(this.#songList);
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
        let filteredSonglist = this.#songList;
        if(offline !== undefined){
            filteredSonglist = await this.#offline(filteredSonglist, offline);
        }
        if(title !== undefined & title !== ""){
            filteredSonglist = this.#titleSearch(filteredSonglist, title);
        }
        // if(artist !== undefined & artist !== ""){
        //     filteredSonglist = this.#artistSearch(filteredSonglist, artist);
        // }
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
            if((offline & song.offline) | (!offline & song.offline)){
                offlineSongs.push(song);
            }
        }
        return offlineSongs;
    }
}

const songList = new Songlist();

async function loadSongs(){
    await songList.prepare();
    eventmanager.fireevent("songsloaded");
}

eventmanager.addEventListener(["utilsloaded"], loadSongs);