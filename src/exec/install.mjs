import {InstallStore} from "../utils/Storage.mjs";
import Tool from "../utils/Tool.mjs";
import Installer from "../utils/Installer.mjs";

const tool = new Tool()
const installStore = new InstallStore()
async function install(args) {
  const installs = installStore.getInstalls()
  // console.log("install", args, installs)
  // 这是可以多个匹配, 如 dog1 i prettier husky
  // TODO 但是多个安装里，有一个错误，应该给到提示
  const matInstalls = installs.filter(item=> args.includes(item.plugin))
  if(!matInstalls.length){
    const argStr = args.join(' | ')
    return tool.error('dog not allowed to install ' + argStr)
  }
  const installer = new Installer()
  await installer.install(installs)
  tool.done("all")
}

export default install
