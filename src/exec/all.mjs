import readlineSync from "readline-sync"
import Installer from "../utils/Installer.mjs"
import {InstallStore} from "../utils/Storage.mjs"
import Tool from "../utils/Tool.mjs"

const tool = new Tool()
const installStore = new InstallStore()
async function all() {
  const answer = readlineSync.question(
    "Would you want to install prettier,husky,typescript by your node version? (y/n) "
  )
  if (answer.toLowerCase() !== "n") {
    const installs = installStore.getPlugins()
    const installer = new Installer()
    await installer.install(installs)
    tool.done("all")
  }else{
    tool.warn('Cancel to install.')
  }
}

export default all
