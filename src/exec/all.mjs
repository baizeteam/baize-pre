import readlineSync from 'readline-sync'
import * as path from "path";
import Installer from "../utils/Installer.mjs";
import Storage from "../utils/Storage.mjs";

async function all(){
    const answer =  readlineSync.question('Will install prettier,husky,typescript by your node version? (y/n) ')
    if(answer.toLowerCase() !== 'n'){
        const installs = new Storage().get().installs
        new Installer(installs)
    }
}

export default all