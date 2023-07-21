const url = new URL(window.location.href);
const songName = url.searchParams.get('songname');

if(songName != undefined){
	getSongByname(songName);
}

async function getSongByname(songName){
	try{
		let chordPro = await fetch("data/songs/"+songName+".chordpro");
		chordPro = await chordPro.text();
		let parsed = parseChordPro(chordPro);
		parsed.html.forEach(element => {
			document.getElementById("rendering-target").appendChild(element);
		});
		
		//Bad for SEO
		if(parsed.title != ""){
			document.title = parsed.title + " - " + parsed.artist;
		}
	}catch(e){
		alert("Song was not found.")
		console.log(e);
	}
}