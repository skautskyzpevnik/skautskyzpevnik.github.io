import { fetchWrapper } from "../utils.js";
import { parse } from "./chordpro/parser.js"
import { titlePageCreator } from "../titlepagecreator.js"
import { Songbook } from "./chordpro/ast.js"

const url = new URL(window.location.href);
const songName = url.searchParams.get('songname');
const songBook = url.searchParams.get('songbook');

if(songBook === "all"){
	renderAll();
}else if(songBook !== null){
	renderSongbook(songBook)
}else if(songName !== null){
	lonelySong(songName);
}

async function lonelySong(songName) {
	let ast = await getSongByName(songName);
	console.log(ast);
	renderFromSongbook(ast);
}

function findSong(list, title, artist){
	let result = undefined;
	for(let song in list.songs){
		song = list.songs[song];
		if(song.title == title & song.artist == artist){
			result = song;
			break;
		}
	}
	return result;
}

async function renderSongbook(songbookName) {
	const songs = [];
	let list = await fetchWrapper("data/list.json");
    list = await list.json();
	let songbook = undefined;
	for( let testSongBook of list.songbooks){
		if(songbookName == testSongBook.file){
			songbook = await fetchWrapper("data/" + testSongBook.file);
			songbook = await songbook.json();
			break;
		}
	}
	if(songbook === undefined){
		alert("Zpěvník neexistuje");
	}else{
		for( let song of songbook.songs){
			song = findSong(list, song.title, song.artist);
			if(song.file === undefined){
				alert("Píseň \"" + song.title + "\" neexistuje");
			} else {
				songs.push(song);
			}
		}
	}
	const ast = await loadSongsFromArray(songs, songbook.title, songbook.subtitle);
	renderFromSongbook(ast);
}

async function renderAll() {
	let list = await fetchWrapper("data/list.json");
	list = await list.json();
	const ast = await loadSongsFromArray(Object.values(list.songs), "Vše", "Skautský zpěvník");
	renderFromSongbook(ast);
}

/**
 * 
 * @param {Array} songArray 
 * @returns 
 */
async function loadSongsFromArray(songArray, title = "", subtitle = "") {
	let startTime = Date.now();
	const songBook = new Songbook();
	songBook.title = title;
	songBook.subtitle = subtitle;
	for (let song of songArray) {
		try {
			// console.log("Started parsing: " + song.title);
			await getSongByName(song.file, songBook);
			// console.log("Finished parsing: " + song.title);
		} catch (e) {
			console.error(song.title);
			console.error(e);
		}
		
	}
	console.log("Parsed " + songArray.length + " songs in " + (Date.now() - startTime) + " ms.");
	return songBook;
}

async function getSongByName(songName, songBook = new Songbook()){
	let chordPro = undefined;
	try{
		chordPro = await fetchWrapper("data/"+songName+".chordpro");
		chordPro = await chordPro.text();
	}catch(e){
		alert("Song was not found.")
		console.log(e);
		return;
	}
	return parse(chordPro, songBook);
}

async function renderFromSongbook(songBook) {
	let startTime = Date.now();
	document.getElementById("rendering-target").appendChild(songBook.html);
	console.log("Render time " + (Date.now() - startTime) + " ms.");
}