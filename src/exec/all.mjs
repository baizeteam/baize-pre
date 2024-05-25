import readlineSync from "readline-sync"
import Installer from "../utils/Installer.mjs"
import Storage from "../utils/Storage.mjs"
import Tool from "../utils/Tool.mjs";


const tool = new Tool()
async function all() {
  const answer = readlineSync.question(
    "Will install prettier,husky,typescript by your node version? (y/n) "
  )
  if (answer.toLowerCase() !== "n") {
    const installs = new Storage().get().installs
    new Installer(installs)
    tool.done('all')
  }
}

export default all
