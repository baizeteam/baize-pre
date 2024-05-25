import readlineSync from "readline-sync"
import Installer from "../utils/Installer.mjs"
import Storage from "../utils/Storage.mjs"
import Tool from "../utils/Tool.mjs"

const tool = new Tool()
const storage = new Storage()
async function all() {
  const answer = readlineSync.question(
    "Will install prettier,husky,typescript by your node version? (y/n) "
  )
  if (answer.toLowerCase() !== "n") {
    const installs = storage.getPlugins()
    const installer = new Installer()
    await installer.install(installs)
    tool.done("all")
  }
}

export default all
