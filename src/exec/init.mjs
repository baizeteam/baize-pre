import Installer from "../utils/Installer.mjs"
import Tool from "../utils/Tool.mjs"

const tool = new Tool()

async function init() {
  const installer = new Installer()
  await installer.choose()
  tool.done(init.name)
}

export default init
