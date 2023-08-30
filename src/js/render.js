const url = new URL(window.location.href);
const songName = url.searchParams.get('songname');
const all = url.searchParams.get('all');

if(all === "true"){
	renderAll();
}else if(songName != undefined){
	getSongByname(songName);
}

async function renderAll(){
	let list = await fetch("data/list.json");
    list = await list.json();
	for(song in list){
		getSongByname(list[song].file);
	}
}

async function getSongByname(songName){
	let chordPro = undefined;
	try{
		chordPro = await fetch("data/"+songName+".chordpro");
		chordPro = await chordPro.text();
	}catch(e){
		alert("Song was not found.")
		console.log(e);
		return;
	}
	song = (parseChordPro(chordPro));

	let html = ChordProRender(song);
	document.getElementById("rendering-target").appendChild(html);

	//Bad for SEO
	if(song.title != ""){
		document.title = song.title + " - " + song.artist;
	}
}

function ChordProRender(songRoot){
	if(songRoot === undefined){
		throw Error("songRoot can not be undefined");
	}
	heading = document.createElement("h1");
	heading.innerText = songRoot.title + " - " + songRoot.artist;
	document.getElementById("rendering-target").appendChild(heading);
	let verseNumber = 1;
	let result = ChordProRenderRecursiveIterator(songRoot, document.createElement("div"), songRoot.type, verseNumber, undefined, songRoot)
	return result;
}

/**
 * 
 * @param {ChordProNode} node 
 * @param {HTMLElement} htmlElement 
 * @param {string} stack
 * @param {number} verseNumber 
 * @param {string} last_chorus 
 * @param {ChordProSong} songRoot 
 * @returns 
 */
function ChordProRenderRecursiveIterator(node, htmlElement, stack, verseNumber, last_chorus, songRoot){
	let nodeToProcess = node.firstChild;
	while(nodeToProcess !== undefined){
		let stackcp = stack + "->" + nodeToProcess.type;

		let element = undefined;
		if(nodeToProcess.type == "song-root"){
			element = document.createElement("div");
			element.setAttribute("song-root");
		}else if(nodeToProcess.type == "verse"){
			let verseHolder = document.createElement("div");
			if(nodeToProcess.name !== undefined){
				verseHolder.appendChild(createChordProName(nodeToProcess.name));
			}else{
				verseHolder.appendChild(createChordProName(verseNumber + "."));
				verseNumber++;
			}
			
			element = document.createElement("p");
			element.setAttribute("class", "verseContent");
			verseHolder.setAttribute("class", "verse");
			verseHolder.appendChild(element);
		}else if(nodeToProcess.type == "chorus"){
			let chorusHolder = document.createElement("div");
			if(node.name !== undefined){
				last_chorus = node.name;
			}else{
				last_chorus = "R";
			}
			chorusHolder.appendChild(createChordProName(last_chorus + ":"));


			element = document.createElement("p");
			element.setAttribute("class", "chorusContent");
			chorusHolder.setAttribute("class", "chorus");
			chorusHolder.appendChild(element);
		}else if(nodeToProcess.type == "line"){
			element = document.createElement("div");
			element.setAttribute("class", "linewrapper");
			let wordToProcess = nodeToProcess.firstChild;
			while(wordToProcess !== undefined){
				const wordWrapper = document.createElement("div");
				wordWrapper.setAttribute("class", "wordWrapper");

				let textOrChord = wordToProcess.firstChild;
				while(textOrChord !== undefined){
					if(textOrChord.type === "text"){
						wordWrapper.appendChild(createChordLyricsWrapper(textOrChord.innerText, ""));
					}else{
						if(textOrChord.nextNode === undefined){
							wordWrapper.appendChild(createChordLyricsWrapper("", textOrChord.innerText));
						}else if(textOrChord.nextNode.type !== "text"){
							wordWrapper.appendChild(createChordLyricsWrapper("", textOrChord.innerText));
						}else{
							if(textOrChord.nextNode.innerText.length > textOrChord.innerText.length | textOrChord.nextNode.innerText === "" | textOrChord.nextNode.nextNode !== undefined | wordToProcess.nextNode === undefined){
								wordWrapper.appendChild(createChordLyricsWrapper(textOrChord.nextNode.innerText, textOrChord.innerText));
							}else if(wordToProcess.nextNode.hasChord){
								wordWrapper.appendChild(createChordLyricsWrapper(textOrChord.nextNode.innerText, textOrChord.innerText));
							}else{
								wordWrapper.appendChild(createChordLyricsWrapper(textOrChord.nextNode.innerText + " " + wordToProcess.nextNode.firstChild.innerText, textOrChord.innerText));
								wordToProcess = wordToProcess.nextNode;
								break;
							}
							textOrChord = textOrChord.nextNode;
						}
					}
					textOrChord = textOrChord.nextNode;
				}
				whitespace = document.createElement("span");
				whitespace.innerHTML = "&nbsp";
				wordWrapper.appendChild(whitespace);
				element.appendChild(wordWrapper);
				wordToProcess = wordToProcess.nextNode;
			}
		}else if(nodeToProcess.type == "choruslink"){
			element = document.createElement("div");
			element.setAttribute("class", "choruslink");
			if(nodeToProcess.chorus !== undefined){
				element.innerText = nodeToProcess.chorus;
			}else if(last_chorus !== undefined){
				element.innerText = last_chorus;
			}else{
				console.error("Song:" + songRoot.title + "\nYou should define at least one chorus before referencing last chorus.")
			}
			if(nodeToProcess.times > 1){
				element.innerText += "x" + nodeToProcess.times;
			}
			
		}

		if(nodeToProcess.firstChild !== undefined & nodeToProcess.type !== "line"){
			ChordProRenderRecursiveIterator(nodeToProcess, element, stackcp, verseNumber, last_chorus, songRoot);
		}
		
		if(nodeToProcess.type == "verse" | nodeToProcess.type == "chorus"){
			element = element.parentElement;
		}

		htmlElement.appendChild(element);
		nodeToProcess = nodeToProcess.nextNode;
	}

	return htmlElement;
}

function createChordProName(name){
	let span = document.createElement("span");
	span.innerText = name;
	span.setAttribute("class", "verseName")
	return span;
}

function createChordLyricsWrapper(lyrics, chord) {
	const chordLyricsWrapper = document.createElement("div");
	chordLyricsWrapper.setAttribute("class", "chordLyricsWrapper");

	const lyricsHolder = document.createElement("span");
	lyricsHolder.setAttribute("class", "lyrics");

	if(chord != ""){
		const chordHolder = document.createElement("span");
		chordHolder.setAttribute("class", "chord");
		chordHolder.innerText = chord;
		chordLyricsWrapper.appendChild(chordHolder);
	}

	if(lyrics == ""){
		lyricsHolder.innerHTML = "&nbsp";
	}else{
		lyricsHolder.innerText = lyrics;
	}
	chordLyricsWrapper.appendChild(lyricsHolder);

	return chordLyricsWrapper;
}