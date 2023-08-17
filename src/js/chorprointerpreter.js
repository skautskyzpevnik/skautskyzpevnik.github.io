/*
 * Copyright (c) 2023 Vojtech Varecha <vojta.varecha@email.cz>
 * Copyright (c) 2014-16 Greg Schoppe <gschoppe@gmail.com>
 * Copyright (c) 2011 Jonathan Perkin <jonathan@perkin.org.uk>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/* Parse a ChordPro template */
function parseChordPro(template) {
	const chordwordregex = /([^\s]*\[[^\]]*\][^\s]*)/;
	const chordregex = /\[([^\]]*)\]/;
	let buffer    = [];
	let title = "";
	let artist = "";

	if (!template) return "";

	let paragraph = document.createElement("p")
	let verse_num = 1;
	let verse_label = ""
	let add_verse = false;
	let last_chorus = ""

	const lineArray = template.split("\n");

	lineArray.forEach(function(line, linenum) {
		let linewrapper = document.createElement("div");
		linewrapper.setAttribute("class", "linewrapper");

		if(add_verse){
			let span = document.createElement("span");
			span.setAttribute("class", "start_of_verse");

			if(verse_label != ""){
				span.innerText = verse_label;
				verse_label = "";
			}else{
				span.innerText = verse_num + "." ;
				verse_num++;
			}
			span.innerHTML += "&nbsp;";
			linewrapper.appendChild(span);
			linewrapper.setAttribute("class", linewrapper.getAttribute("class") + " move_left");
			add_verse = false;
		}


		/* Comment, ignore */
		if (line.match(/^#/)) {
			return "";
		}else if (line.match(chordregex)) {
		/* Chord line */
			const wordSplit = line.split(" ");
			let i = 0;
			while(i < wordSplit.length){
				let word = wordSplit[i];
				const wordWrapper = document.createElement("div");
				wordWrapper.setAttribute("class", "wordWrapper");
				if(word.match(chordregex)){
					const wordchordsplit = word.split(chordregex);
					let j = 0;
					while(j < wordchordsplit.length){
						let match = wordchordsplit[j];
						if(match != ""){						
							if(j%2){
								if(wordchordsplit[j] < wordchordsplit[j+1] & !wordSplit[i+1].match(chordregex)){
									// chord longer than lyrics and we can use next word
									wordWrapper.appendChild(createChordLyricsWrapper(wordchordsplit[j+1] + " " + wordSplit[i+1], match));
								}else{
									wordWrapper.appendChild(createChordLyricsWrapper(wordchordsplit[j+1], match));
								}
								
								j++;
							}else{
								wordWrapper.appendChild(createChordLyricsWrapper(match, ""));
							}
						}
						j++;
					}
				}else{
					wordWrapper.appendChild(createChordLyricsWrapper(word, ""));
				}
				linewrapper.appendChild(wordWrapper);
				wordWrapper.appendChild(createChordLyricsWrapper(" ", ""));
				linewrapper.appendChild(wordWrapper);
				i++;
			}
			paragraph.appendChild(linewrapper);
		}else if (line.match(/^{.*}/)) {
			//ADD COMMAND PARSING HERE
			//reference: http://tenbyten.com/software/songsgen/help/HtmlHelp/files_reference.htm
			// implement basic formatted text commands
			var matches = line.match(/^{(title|t|subtitle|st|comment|c|artist|start_of_chorus|soc|end_of_|eoc|start_of_verse|sov|end_of_verse|eov|chorus|x_cht)(:\s*(.*))?}/, "i");
			if(matches != null){
				if( matches.length >= 3 ) {
					var command = matches[1];
					var text = matches[3];
					var wrap="";
					//add more non-wrapping commands with this switch
					switch( command ) {
						case "title":
						case "t":
							title = text;
							break;
						case "artist":
							artist = text;
							break;
						case "subtitle":
						case "st":
							command = "subtitle";
							wrap = "h4";
							break;
						case "comment":
						case "c":
							command = "comment";
							wrap    = "em";
							break;
						case "start_of_chorus":
						case "soc":
							add_verse = true
							buffer.push(paragraph);
							paragraph = document.createElement("p");
							if(text != undefined){
								verse_label = text;
								last_chorus = verse_label;
							}else{
								verse_label = "R:";
								last_chorus = "R";
							}
						
							break;
						case "end_of_chorus":
						case "eoc":
							break;
						case "start_of_verse":
						case "sov":
							add_verse = true
							buffer.push(paragraph);
							paragraph = document.createElement("p");
							if(text != undefined){
								verse_label = text;
							}else{
								verse_label = "V:";
							}
						
							break;
						case "end_of_verse":
						case "eov":
							break;

						case "x_cht":
							buffer.push(paragraph);
							paragraph = document.createElement("p");

							let x_chtspan = document.createElement("span");
							x_chtspan.setAttribute("class", "chorus");
							x_chtspan.innerText = last_chorus + text
							paragraph.appendChild(x_chtspan);

							buffer.push(paragraph);
							paragraph = document.createElement("p");

							break;
						case "chorus":
							buffer.push(paragraph);
							paragraph = document.createElement("p");

							let chtspan = document.createElement("span");
							chtspan.setAttribute("class", "chorus");
							chtspan.innerText = last_chorus
							paragraph.appendChild(chtspan);

							buffer.push(paragraph);
							paragraph = document.createElement("p");

							break;
					}
					if( wrap ) {
						let elem = document.createElement(wrap);
						elem.setAttribute("class", command);
						elem.innerText = text;

						buffer.push(elem);
					}
				}
			}
			// work from here to add wrapping commands
		}else if(line == ""){
			// end verse
			buffer.push(paragraph);
			paragraph = document.createElement("p");
			
			add_verse = true
			
		}else{
			/* Anything else */

			span = document.createElement("span");
			span.setAttribute("class", "lyrics")
			span.innerText = line;
			linewrapper.appendChild(span);
			br = document.createElement("br");
			linewrapper.appendChild(br);
			paragraph.appendChild(linewrapper)
			
		}
	}, this);
	buffer.push(paragraph);
	heading = document.createElement("h1");
	heading.innerText = title + " - " + artist
	buffer.unshift(heading);
	return {
		"title": title,
		"artist": artist,
		"html": buffer
	};
}

function createChordLyricsWrapper(lyrics, chord) {
	const chordLyricsWrapper = document.createElement("div");
	chordLyricsWrapper.setAttribute("class", "chordLyricsWrapper");

	const lyricsHolder = document.createElement("span");
	lyricsHolder.setAttribute("class", "lyrics");

	const chordHolder = document.createElement("span");
	chordHolder.setAttribute("class", "chord");

	if(chord == ""){
		chordHolder.innerHTML = "&nbsp";
	}else{
		chordHolder.innerText = chord;
	}

	chordLyricsWrapper.appendChild(chordHolder);

	if(lyrics == ""){
		lyricsHolder.innerHTML = "&nbsp";
	}else{
		lyricsHolder.innerText = lyrics;
	}
	chordLyricsWrapper.appendChild(lyricsHolder);

	return chordLyricsWrapper;
}