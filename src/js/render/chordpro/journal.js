/**
 * @typedef {import('./nodes/songbook.js').Songbook} Songbook
 */

import { currentSongBook } from '../index.js';

export class Action{
    nodeId = -1;
    /**
     * @param {string} nodeId 
     */
    constructor(nodeId){
        this.nodeId = nodeId;
    }
    /**
     * This undo an action
     * @param {Songbook} songBook songbook reference
     */
    undo(songBook){

    }

    /**
     * This redo an action
     * @param {Songbook} songBook songbook reference
     */
    redo(songBook){

    }
}

export class Journal{
    /** @type {Action[]} */
    actionArray = [];
    actionIndex = -1;
    constructor(){

    }
    /**
     * Does some action
     * @param {Action} action 
     */
    addAction(action){
        if(this.actionIndex < (this.actionArray.length)-1){
            this.actionIndex += 1;
            this.actionArray.splice(this.actionIndex);
            this.actionArray.push(action);
        }else{
            this.actionArray.push(action);
            this.actionIndex += 1;
        }
    }
    
    /**
     * This undo last action
     */
    undo(){
        if(this.actionIndex >= 0){
            let action = this.actionArray[this.actionIndex];
            action.undo(currentSongBook)
            this.actionIndex -= 1;
        }
    }

    /**
     * This redo last action
     */
    redo(){
        if((this.actionIndex + 1) < this.actionArray.length){
            this.actionIndex += 1;
            let action = this.actionArray[this.actionIndex];
            action.redo(currentSongBook)
        }
    }
}