import {InstallStore} from "../utils/Storage.mjs";
import Tool from "../utils/Tool.mjs";
import Installer from "../utils/Installer.mjs";
// import Commands from "../common/Commands.mjs";

const tool = new Tool()
// const commands = new Commands() // 循环依赖
const installStore = new InstallStore()
async function install(args) {
  const installs = installStore.get()
  // console.log("install", args, installs)
  // 这是可以多个匹配, 如 dog i prettier husky
  // TODO 但是多个安装里，有一个错误，应该给到提示
  const matInstalls = installs.filter(item=> args.includes(item.plugin))
  if(!matInstalls.length){
    const argStr = args.join(' | ')
    return tool.error('dog ' + 'not allow to installed ' + argStr.trim() || undefined)
  }
  const installer = new Installer()
  await installer.install(matInstalls)
  tool.done("all")
}

export default install
