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

class ChordProNode{
	previousNode = undefined;
	nextNode = undefined;
	#parentNode = undefined;

	get parentNode(){
		if(this.type === "song-root"){
			return this;
		}else{
			return this.#parentNode;
		}
	}

	set parentNode(value){
		if(this.type === "song-root"){
			console.error("You cannot set parentNode of song-root.")
		}else{
			this.#parentNode = value;
		}
	}

	remove(){
		if(this.type !== "song-root"){
			let previousNode = this.previousNode;
			let nextNode = this.nextNode;
			if(this.previousNode !== undefined & this.nextNode !== undefined){
				//middle
				this.previousNode.nextNode = nextNode;
				this.nextNode.previousNode = previousNode;
			}else if(this.previousNode === undefined & this.previousNode !== undefined){
				//first
				this.parentNode.removeFirstChild();
			}else{
				//last
				this.parentNode.removeLastChild();
			}
		}else{
			console.error("Tried to remove song-root node.");
		}
	}
}

class ChordProTextNode extends ChordProNode{
	BlankLineNewVerse = false;
	constructor(innerText, type){
		super();
		this.innerText = innerText;
		this.type = type;
	}
}

class ChordProChorusLink extends ChordProNode{
	type = "choruslink"
	constructor(chorus, times){
		super();
		this.chorus = chorus;
		this.times = times;
	}
}

class ChordProCollectionNode extends ChordProNode{
	BlankLineNewVerse = true;
	#firstChild = undefined;
	#lastChild = undefined;
	constructor(type=""){
		super();
		this.type = type;
	}
	appendChild(node){
		if(node !== undefined){
			node.parentNode = this;
			if(this.#firstChild === undefined){
				this.#firstChild = node;
				this.#lastChild = node;
			}else if(this.#lastChild !== undefined){
				node.previousNode =  this.#lastChild;
				this.#lastChild.nextNode = node;	
			}else{
				console.error("There ahould always be lastChild if there is firstchild");
			}
			this.#lastChild = node;
		}
	}
	
	removeLastChild(){
		if(this.#lastChild.previousNode !== undefined){
			this.#lastChild.previousNode.nextNode = undefined;
		}else{
			this.#firstChild = undefined;
		}
		this.#lastChild = this.#lastChild.previousNode;
	}

	removeFirstChild(){
		if(this.#firstChild.nextNode !== undefined){
			this.#firstChild.nextNode.previousNode = undefined;
		}else{
			this.#lastChild = undefined;
		}
		this.#firstChild = this.#firstChild.previousNode;
	}

	get firstChild(){
		return this.#firstChild;
	}
	get lastChild(){
		return this.#lastChild;
	}

	get innerText(){
		let result = "";
		this.forEach(function(active_child) {
			result += active_child.innerText;
		})
		return result;
	}

	get array(){
		let tmp = [];
		this.forEach(function(element){
			tmp.push(element);
		});
		return tmp;
	}

	forEach(callback){
		let i = 0;
		let active_child = this.firstChild;
		while(active_child !== undefined){
			callback(active_child, i);
			i++;
			active_child = active_child.nextNode;
		}
	}
}

class ChordProSong extends ChordProCollectionNode{
	title="";
	artist="";
	constructor(){
		super("song-root")
	}
}

class ChordProLine extends ChordProCollectionNode{
	constructor(){
		super("line");
	}
	get innerText(){
		let result = "";
		this.forEach(function(active_child) {
			result += active_child.innerText;
		})
		return result + "\n";
	}
}

class ChordProVerse extends ChordProCollectionNode{
	constructor(name=undefined){
		super("verse");
		this.name = name;
	}
	get innerText(){
		let result = "";
		this.forEach(function(active_child) {
			result += active_child.innerText;
		})
		return result + "\n";
	}
}

class ChordProChorus extends ChordProCollectionNode{
	BlankLineNewVerse = false;
	constructor(name=""){
		super("chorus");
		this.name = name;
	}
	get innerText(){
		let result = "";
		this.forEach(function(active_child) {
			result += active_child.innerText;
		})
		return result + "\n";
	}
}

class ChordProWord extends ChordProCollectionNode{
	hasChord = false;
	constructor(){
		super("word");
	}
	appendChord(node){
		this.hasChord = true;
		this.appendChild(node);
	}
	get innerText(){
		let result = "";
		this.forEach(function(active_child) {
			result += active_child.innerText;
		})
		return result + " ";
	}
}

class ChordProChord extends ChordProTextNode{
	constructor(innerText){
		super(innerText, "chord");
	}
}

class ChordProText extends ChordProTextNode{
	constructor(innerText){
		super(innerText, "text");
	}
}

/* Parse a ChordPro template */
function parseChordPro(template){

	const chordregex = /\[([^\]]*)\]/;
	if(!template){
		throw Error("Please provide nonemptystring template.")
	}
	
	/**
	 * 
	 * @param {string} line 
	 * @param {ChordProLine} lineNode 
	 * @returns {ChordProLine}
	 */
	function parseLine(line, lineNode){
		line.split(" ").forEach(function(rawWord){
			let word = new ChordProWord();
			if(rawWord.match(chordregex)){
				rawWord.split(chordregex).forEach(function(wordPart, partNumber){
					if(partNumber%2){
						let chord = new ChordProChord(wordPart);
						word.appendChord(chord); 
					}else{
						let textNode = new ChordProText(wordPart);
						word.appendChild(textNode); 
					}
				});		
			}else{
				let textNode = new ChordProText(rawWord);
				word.appendChild(textNode); 	
			}
			lineNode.appendChild(word);
		});
		return lineNode;
	} 

	
	let rootNode = new ChordProSong();
	let curentNode = rootNode;
	let lastAction = undefined;
	template.split("\n").forEach(function(line, linenum) {
		
		/* Comment, ignore */
		if (line.match(/^#/)) {
			return "";
		}else if (line.match(/^{.*}/)) {
			lastAction = "command";

			//remove empety verse nodes
			curentNode = removeVerseIfEmpty(curentNode);

			//ADD COMMAND PARSING HERE
			//reference: http://tenbyten.com/software/songsgen/help/HtmlHelp/files_reference.htm
			// implement basic formatted text commands
			let matches = line.match(/^{(title|t|subtitle|st|comment|c|artist|start_of_chorus|soc|end_of_|eoc|start_of_verse|sov|end_of_verse|eov|chorus|x_cht)(:\s*(.*))?}/, "i");
			if(matches != null){
				if( matches.length >= 3 ) {
					let command = matches[1];
					let text = matches[3];
					//add more non-wrapping commands with this switch
					switch( command ) {
						case "title":
						case "t":
							if(rootNode.title != ""){
								console.error("Title defined more tham once!");
							}else{
								rootNode.title = text;
							}
							break;
						case "artist":
							if(rootNode.artist != ""){
								console.error("Artist defined more tham once!");
							}else{
								rootNode.artist = text;
							}
							break;
						case "subtitle":
						case "st":
							if(rootNode.subtitle != ""){
								console.error("Subtitle defined more tham once!");
							}else{
								rootNode.subtitle = text;
							}
							break;
						case "comment":
						case "c":
							break;
						case "start_of_chorus":
						case "soc":
							curentNode = rootNode;
							let chorusNode = new ChordProChorus(text);
							curentNode.appendChild(chorusNode);
							curentNode = chorusNode;
							break;
						case "start_of_verse":
						case "sov":
							if(curentNode.type == "verse"){
								curentNode = curentNode.parentNode;
							}
							let verseNode = new ChordProVerse(text);
							curentNode.appendChild(verseNode);
							curentNode = verseNode;
							break;
						case "end_of_verse":
						case "eov":
							if(curentNode.type === "verse"){
								curentNode = curentNode.parentNode;
							}
							lastAction = "songline";
							let tmpNode = new ChordProVerse();
							curentNode.appendChild(tmpNode);
							curentNode = tmpNode
						case "end_of_chorus":
						case "eoc":
							lastAction = "songline";
							if(curentNode.type !== "chorus"){
								
							}else{
								curentNode = new ChordProVerse();
								rootNode.appendChild(curentNode);
							}
							break;
						case "x_cht":
							curentNode = curentNode.parentNode;
							curentNode.appendChild(new ChordProChorusLink(text, 1));
							break;
						case "chorus":
							if(curentNode.appendChild === undefined | curentNode.type === "verse") {
								curentNode = curentNode.parentNode;	
							}
							if(curentNode.lastChild !== undefined){
								if(curentNode.lastChild.type === "choruslink"){
									if(curentNode.lastChild.name === text){
										curentNode.lastChild.times++;
									}else{
										curentNode.appendChild(new ChordProChorusLink(text, 1));
									}
								}else{
									curentNode.appendChild(new ChordProChorusLink(text, 1));	
								}
							}else{
								curentNode.appendChild(new ChordProChorusLink(text, 1));
							}
							break;
					}
				}
			}
			// work from here to add wrapping commands
		}else if(line == ""){
			// end verse
			if(lastAction != "newVerse"){
				lastAction = "newVerse";
				curentNode = newVerse(curentNode);
			}
		}else{
			/* song line */
			lastAction = "songline";
			
			if(curentNode.type !== "verse" & curentNode.type !== "chorus"){
				curentNode = new ChordProVerse();
				rootNode.appendChild(curentNode);
			}
			let outLine = parseLine(line, new ChordProLine());
			curentNode.appendChild(outLine);
		}
	}, this);
	removeVerseIfEmpty(curentNode);
	return rootNode
}

function newVerse(curentNode){
	if(!isBlankVerse(curentNode)){
		if(curentNode.BlankLineNewVerse){
			let verse = new ChordProVerse();
			if(curentNode.type == "song-root"){
				curentNode.appendChild(verse)
			}else{
				curentNode.parentNode.appendChild(verse)
			}
			
			curentNode = verse;
		}
	}
	return curentNode;
}

/**
 * 
 * @param {ChordProNode} node 
 */
function isBlankVerse(node){
	if(node.type == "verse" & node.firstChild == undefined){
		return true;
	}else{
		return false;
	}
}

/**
 * 
 * @param {ChordProNode} innode 
 * @returns {ChordProNode} same or parent node
 */
function removeVerseIfEmpty(innode){
	let tmpNode = innode;
	if(isBlankVerse(innode)){
		tmpNode = innode.parentNode;
		
		innode.remove();
		delete innode;
	}
	return tmpNode;
}