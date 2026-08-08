import { fetchWrapper } from "../utils.js";
import { parse } from "./chordpro/parser.js"
import { Songbook } from "./chordpro/nodes/songbook.js";

/**
 * @typedef {import('./chordpro/abstractNodes/leafNode.js').SyntaxTreeLeafNode} SyntaxTreeLeafNode
 */

/**@type {SyntaxTreeLeafNode|undefined} */
export let currentSongBook = undefined;
const url = new URL(window.location.href);
const songName = url.searchParams.get('songname');
const songBook = url.searchParams.get('songbook');

if (songBook === "all") {
	renderAll();
} else if (songBook !== null) {
	renderSongbook(songBook)
} else if (songName !== null) {
	lonelySong(songName);
}

/**
 * Renders just one song
 * @param {string} songName 
 */
async function lonelySong(songName) {
	let startTime = Date.now();
	let ast = await getSongByUrl(sanitizeName(songName), new Songbook(), getUrlFromSongName(songName));
	console.log("Parsed song in " + (Date.now() - startTime) + " ms.");
	renderFromSongbook(ast);
}

/**
 * Renders just one song from url
 * @param {string} filename
 * @param {string} url
 */
export async function lonelySongFromUrl(url, filename) {
	let startTime = Date.now();
	let ast = await getSongByUrl(sanitizeName(filename), new Songbook(), url);
	console.log("Parsed song in " + (Date.now() - startTime) + " ms.");
	renderFromSongbook(ast);
}

/**
 * Finds song by title and artist
 * @param {Object} list list of songs
 * @param {string} title 
 * @param {string} artist 
 * @returns 
 */
function findSong(list, title, artist) {
	let result = undefined;
	for (let song in list.songs) {
		song = list.songs[song];
		if (song.title == title & song.artist == artist) {
			result = song;
			break;
		}
	}
	return result;
}

/**
 * Renders whole songbook
 * @param {string} songbookName 
 */
async function renderSongbook(songbookName) {
	const songs = [];
	let list = await fetchWrapper("data/list.json");
	list = await list.json();
	let songbook = undefined;
	for (let testSongBook of list.songbooks) {
		if (songbookName == testSongBook.file) {
			songbook = await fetchWrapper("data/" + testSongBook.file);
			songbook = await songbook.json();
			break;
		}
	}
	if (songbook === undefined) {
		alert("Zpěvník neexistuje");
	} else {
		for (const songObj of songbook.songs) {
			const song = findSong(list, songObj.title, songObj.artist);
			if (song.file === undefined) {
				alert("Píseň \"" + song.title + "\" neexistuje");
			} else {
				songs.push(song);
			}
		}
	}
	let ast = await loadSongsFromArray(songs, songbook.title, songbook.subtitle, songbookName);
	renderFromSongbook(ast);
}

/**
 * Renders everything
 */
async function renderAll() {
	let list = await fetchWrapper("data/list.json");
	list = await list.json();
	let ast = await loadSongsFromArray(Object.values(list.songs), "Vše", "Skautský zpěvník", "all");
	renderFromSongbook(ast);
}

/**
 * Loads all songs from array
 * @param {Array} songArray 
 * @returns {Songbook}
 */
async function loadSongsFromArray(songArray, title = "", subtitle = "", filename = undefined) {

	let startTime = Date.now();
	const chorArraydPro = await Promise.all(songArray.map(async (song) => {
		return await getChordpro(getUrlFromSongName(song.file));
	}));
	console.log("Downloaded " + songArray.length + " songs in " + (Date.now() - startTime) + " ms.");

	startTime = Date.now();
	const songBook = new Songbook();
	songBook.filename = filename;
	songBook.title = title;
	songBook.subtitle = subtitle;
	for (let song of chorArraydPro) {
		parse(song, songBook);
	}
	console.log("Parsed " + songArray.length + " songs in " + (Date.now() - startTime) + " ms.");
	return songBook;
}

/**
 * Returns song url from songname 
 * @param {string} songName 
 * @returns {string}
 */
function getUrlFromSongName(songName) {
	return "data/" + songName + ".chordpro";
}

/**
 * Gets chordpro text by url
 * @param {string} url
 * @returns {string} chordpro string
 */
async function getChordpro(url) {
	let chordPro = undefined;
	try {
		chordPro = await fetchWrapper(url);
		chordPro = await chordPro.text();
	} catch (e) {
		alert("Song was not found.")
		console.log(e);
		return;
	}
	return chordPro
}

function sanitizeName(songName) {
	let name = songName.split("/");
	return name[name.length - 1]
}

/**
 * Gets song by url
 * @param {string} songName 
 * @param {Songbook} songBook 
 * @returns {Songbook}
 */
async function getSongByUrl(songName, songBook = new Songbook(), url) {
	return parse(await getChordpro(url), songBook, songName);
}

/**
 * Renders songs from songbook
 * @param {Songbook} songBook 
 */
async function renderFromSongbook(songBook) {
	currentSongBook = songBook;
	let startTime = Date.now();
	document.getElementById("rendering-target").appendChild(songBook.html);
	console.log("Render time " + (Date.now() - startTime) + " ms.");
}

