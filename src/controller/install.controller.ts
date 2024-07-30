import { PluginService } from "@/service/plugin.service";
import { loggerService } from "@/service/logger.service";
import { installerService } from "@/service/installer.service";
import { commandService } from "@/service/command.service";

export class InstallController {
  static key = "install";
  constructor(pluginNames: string[] = []) {
    // TODO 但是多个安装里，有一个错误，应该给到提示
    const pluginService = new PluginService(false);
    const matInstalls = pluginService
      .get()
      .filter((item) => pluginNames.includes(item.name));
    if (!matInstalls.length) {
      console.log("插件名错误");
      const pluginStr = pluginService.getAll().join(" | ").trim();
      loggerService.error(
        `Error: ${commandService.main} is only allow to install "${pluginStr}.`
      );
    } else {
      console.log("到这里");
      installerService
        .install(matInstalls)
        .then(() => loggerService.finish(InstallController.key));
    }
  }
}
