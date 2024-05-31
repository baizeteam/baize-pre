import {InstallStore} from "../utils/Storage.mjs";
import Tool from "../utils/Tool.mjs";
import Installer from "../utils/Installer.mjs";

const tool = new Tool()
const installStore = new InstallStore()

async function uninstall(args){
    const installs = installStore.get()
    const matInstalls = installs.filter((item) => args.includes(item.plugin))
    if (!matInstalls.length) {
        const pluginStr = installStore.getPlugins().join(" | ").trim()
        return tool.error(
            "Error: baize " + "is only allow to uninstall " + pluginStr + ' .'
        )
    }
    const installer = new Installer()
    await installer.uninstall(matInstalls)
    tool.done(uninstall.name)
}

export default uninstall