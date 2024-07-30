import { loggerService } from "@/service/logger.service";
import { PackageService } from "@/service/package.service";
import * as readline from "readline-sync";
import fsExtra from "fs-extra";
import { join } from "path";
import { PluginService } from "@/service/plugin.service";
import { StoreService } from "@/service/store.service";
import { ConfigInstance } from "@/instance/config.instance";
import { TYPE_CONFIG_ITEM } from "@/type/config.type";
import { toolService } from "@/service/tool.service";

export class ConfigService implements ConfigInstance {
  public get: () => void;
  public set: () => void;
  static get(isDefault: boolean, matPlugins: any[]): TYPE_CONFIG_ITEM {
    const storeService = new StoreService(false);
    const plugins = storeService.get().installs;
    const matConfigs: TYPE_CONFIG_ITEM = {};
    plugins.forEach((pluginItem) => {
      matPlugins.forEach((pluginName) => {
        if (pluginName === pluginItem.name) {
          matConfigs[pluginName] = pluginItem.config;
        }
      });
    });
    loggerService.success(toolService.formatJSON(matConfigs));
    return matConfigs;
  }
  static set(isDefault: boolean, matPlugins: any[]) {
    // set default (恢复默认) 的判断
    if (isDefault) {
      const answer = readline.question(
        "Would you like to set the default config ? (y/n)"
      );
      if (answer.toLowerCase() !== "n") {
        try {
          new PluginService(false).reset();
          loggerService.success("Successfully.");
        } catch (e) {
          loggerService.error("Error: " + e);
        }
      } else {
        loggerService.warn("Cancel the setting process.");
      }
      return;
    }
    const keyStr = matPlugins.join(",").trim();
    console.log(keyStr, "keyStr", matPlugins);
    const answer = readline.question(
      `Would you like to set "${keyStr}" for your local files? (y/n)`
    );
    if (answer.toLowerCase() !== "n") {
      // 很明显是 读取 用户 的pkg
      const packageService = new PackageService(true);
      const pluginService = new PluginService(true);
      const configs = this.get(isDefault, matPlugins);
      console.log(configs, "configs");
      for (let key in configs) {
        const item = configs[key];
        const userConfigFilePath = join(packageService.curDir, item.file);
        console.log(userConfigFilePath, "filepath");
        if (!fsExtra.existsSync(userConfigFilePath))
          return loggerService.error("Error: read your local file failed.");
        const file = fsExtra.readFileSync(userConfigFilePath, "utf-8");
        console.log(file, "file");
        // 将用户的配置注入到我们的 store.user.json 中
        pluginService.set(key, file);
        loggerService.success("Successfully.");
      }
    } else {
      loggerService.warn("Cancel the setting process.");
    }
  }
}

export const configService = new ConfigService();
