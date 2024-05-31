import readlineSync from "readline-sync"
import Installer from "../utils/Installer.mjs"
import { InstallStore } from "../utils/Storage.mjs"
import Tool from "../utils/Tool.mjs"

const tool = new Tool()
const installStore = new InstallStore()
async function all() {
  const answer = readlineSync.question(
    "Would you like to install prettier, husky, and typescript that work with your Node.js version? (y/n) "
  )
  if (answer.toLowerCase() !== "n") {
    const installs = installStore.get()
    const installer = new Installer()
    await installer.install(installs)
    tool.done(all.name)
  } else {
    tool.warn("Cancel the installation")
  }
}

export default all
