import { PluginService } from "@/service/plugin.service";
import { loggerService } from "@/service/logger.service";
import { installerService } from "@/service/installer.service";
import { commandService } from "@/service/command.service";

export class UninstallController {
  static key = "uninstall";
  constructor(pluginNames: string[] = []) {
    const pluginService = new PluginService(false);
    const matInstalls = pluginService
      .get()
      .filter((item) => pluginNames.includes(item.name));
    if (!matInstalls.length) {
      const pluginStr = pluginService.getAll().join(" | ").trim();
      loggerService.error(
        `Error: ${commandService.main} "is only allow to uninstall ${pluginStr}.`
      );
    } else {
      installerService
        .uninstall(matInstalls)
        .then(() => loggerService.finish(UninstallController.key));
    }
  }
}
