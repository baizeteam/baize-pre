import { InstallStore } from "../utils/Storage.mjs"
import Tool from "../utils/Tool.mjs"
import Installer from "../utils/Installer.mjs"
// import Commands from "../common/Commands.mjs";

const tool = new Tool()
// const commands = new Commands() // 循环依赖
const installStore = new InstallStore()
async function install(args) {
  const installs = installStore.get()
  // console.log("install", args, installs)
  // 这是可以多个匹配, 如 baize i prettier husky
  // TODO 但是多个安装里，有一个错误，应该给到提示
  const matInstalls = installs.filter((item) => args.includes(item.plugin))
  if (!matInstalls.length) {
    const pluginStr = installStore.getPlugins().join(" | ").trim()
    return tool.error(
      "Error: baize " + "is only allow to install " + pluginStr + ' .'
    )
  }
  const installer = new Installer()
  await installer.install(matInstalls)
  tool.done(install.name)
}

export default install
