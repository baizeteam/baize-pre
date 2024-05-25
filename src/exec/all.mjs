import readlineSync from "readline-sync"
import Installer from "../utils/Installer.mjs"
import Storage from "../utils/Storage.mjs"
import Tool from "../utils/Tool.mjs"
import Mgr from "../utils/Mgr.mjs";

const tool = new Tool()
const mgr = new Mgr()
const storage = new Storage()
async function all() {
  const answer = readlineSync.question(
    "Will install prettier,husky,typescript by your node version? (y/n) "
  )
  if (answer.toLowerCase() !== "n") {
    const installs = storage.getPlugins()
    await mgr.choose()
    const installer = new Installer(mgr.mgr)
    installer.preInstall(installs)
    tool.done("all")
  }
}

export default all
