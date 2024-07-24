import { fetchWrapper } from "../utils.js";
import { parse } from "./chordpro/parser.js"
import { Songbook, SyntaxTreeLeafNode } from "./chordpro/ast.js"

/**@type {SyntaxTreeLeafNode|undefined} */
export let currentSongBook = undefined;
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
	let startTime = Date.now();
	let ast = await getSongByName(songName);
	console.log("Parsed song in " + (Date.now() - startTime) + " ms.");
	renderFromSongbook(ast);
}

export async function lonelySongFromUrl(url, filename) {
	let startTime = Date.now();
	let ast = await getSongByUrl(filename, new Songbook(), url);
	console.log("Parsed song in " + (Date.now() - startTime) + " ms.");
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
	let ast = await loadSongsFromArray(songs, songbook.title, songbook.subtitle, songbookName);
	renderFromSongbook(ast);
}

async function renderAll() {
	let list = await fetchWrapper("data/list.json");
	list = await list.json();
	let ast = await loadSongsFromArray(Object.values(list.songs), "Vše", "Skautský zpěvník", "all");
	renderFromSongbook(ast);
}

/**
 * 
 * @param {Array} songArray 
 * @returns 
 */
async function loadSongsFromArray(songArray, title = "", subtitle = "", filename = undefined) {
	let startTime = Date.now();
	const songBook = new Songbook();
	songBook.filename = filename;
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

/**
 * 
 * @param {string} songName 
 * @param {Songbook} songBook 
 * @returns 
 */
async function getSongByName(songName, songBook = new Songbook()) {
	return await getSongByUrl(songName, songBook, "data/" + songName + ".chordpro");
}

/**
 * 
 * @param {string} songName 
 * @param {Songbook} songBook 
 * @returns 
 */
async function getSongByUrl(songName, songBook = new Songbook(), url){
	let chordPro = undefined;
	try{
		chordPro = await fetchWrapper(url);
		chordPro = await chordPro.text();
	}catch(e){
		alert("Song was not found.")
		console.log(e);
		return;
	}
	let name = songName.split("/");
	name = name[name.length - 1]
	return parse(chordPro, songBook, name);
}

/**
 * 
 * @param {Songbook} songBook 
 */
async function renderFromSongbook(songBook) {
	currentSongBook = songBook;
	let startTime = Date.now();
	document.getElementById("rendering-target").appendChild(songBook.html);
	console.log("Render time " + (Date.now() - startTime) + " ms.");
}

