import { SyntaxTreeNodeWithChildren } from "../abstractNodes/nodeWithChildren.js";
import { titlePageCreator } from "../../../titlepagecreator.js";
import { sanitizeFile } from "../helper.js";

/**
 * @import { Song } from "./song.js";
 */

/**
 * 
 * @param {FileSystemDirectoryHandle} folder 
 * @param {string} filename
 * @param {string} url
 * 
 * @returns {FileSystemFileHandle}
 */
async function downloadToFile(folder, filename, url) {
    const newFileHandle = await folder.getFileHandle(filename, { create: true });
    const newFileWriteable = await newFileHandle.createWritable();

    const response = await fetch(url);

    response.body.pipeTo(newFileWriteable)

    return newFileHandle;
}

/**
 * Class implementing songbook ast node
 */
export class Songbook extends SyntaxTreeNodeWithChildren {
    title = "";
    subtitle = "";
    /**@type {string|undefined} */
    filename = undefined;
    get html() {
        let element = document.createElement("div");
        element.setAttribute("class", "song-book");
        if (this.title !== "" || this.subtitle !== "") {
            element.appendChild(titlePageCreator(this.title, this.subtitle))
        }
        for (let child of this.children) {
            try {
                element.appendChild(child.html);
            } catch (e) {
                console.error(e);
                console.log(child);
            }

        }
        return element;
    }
    get chordpro() {
        let text = "";
        for (let child of this.children) {
            text += child.chordpro;
        }
        return text;
    }

    get tex() {
        let text = "";
        for (let child of this.children) {
            text += child.tex;
        }
        return text;
    }

    /**
     * 
     * @param {FileSystemDirectoryHandle} dirHandle 
     */
    async toTexFolder(dirHandle) {
        await downloadToFile(dirHandle, ".latexmkrc", "/assets/latex/.latexmkrc")

        const mainHandle = await dirHandle.getFileHandle("main.tex", { create: true });
        const mainWriteable = await mainHandle.createWritable();

        {
            const response = await (await fetch("/assets/latex/main.tex")).text();
            await mainWriteable.write(response);
        }

        {
            const utilsHandle = await dirHandle.getDirectoryHandle('utils', {
                create: true,
            });
            await downloadToFile(utilsHandle, "commands.tex", "/assets/latex/commands.tex")
        }

        const songsHandle = await dirHandle.getDirectoryHandle('songs', {
            create: true,
        });

        /** @type {Song[]} */
        this.children;

        for (let child of this.children) {
            const filename = sanitizeFile(`${child.title}-${child.artist}`);
            const newFileHandle = await songsHandle.getFileHandle(filename + ".tex", { create: true });
            const newFileWriteable = await newFileHandle.createWritable();
            await newFileWriteable.write(child.tex);
            await newFileWriteable.close();

            await mainWriteable.write(`\\include{songs/${filename}}\n`);
        }

        await mainWriteable.write(`\n\\end{document}\n`);

        await mainWriteable.close();
    }
}