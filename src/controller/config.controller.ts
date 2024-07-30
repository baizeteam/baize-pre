import { commandService } from "@/service/command.service";
import { loggerService } from "@/service/logger.service";
import { ConfigService, configService } from "@/service/config.service";
import { ConfigInstance } from "@/instance/config.instance";
import { PluginService } from "@/service/plugin.service";
import { PluginInstance } from "@/instance/plugin.instance";

export class ConfigController {
  static key = "config";
  public args: any[] = [];
  public configService: ConfigInstance = configService;
  private pluginService: PluginInstance;
  private isDefault: boolean = false;
  constructor(args: string[] = []) {
    this.args = args;
    try {
      this.#check();
    } catch (e) {
      loggerService.error(e);
    }
  }
  #check() {
    if (!this.args.length || this.args.length > 3) return this.#error();
    const action: "get" | "set" = this.args[0].trim(); // 这时候必有action动作，判断是 get or set
    if (action !== "get" && action !== "set") return this.#error();
    const expectPluginName = this.args[1];
    if (!expectPluginName) return this.#error(); // 格式不对，get or set后要接 具体插件名
    if (expectPluginName === "default" && !this.args[2]) {
      // 如果 get or set 后只有 default，则检测的任务就完成了，直接get or set default给用户反馈
      return (this.isDefault = true);
    }
    this.pluginService = new PluginService(false);
    const pluginNames = this.pluginService.getAll(); //
    const matPlugins = pluginNames.filter((name) =>
      this.args.slice(1).includes(name)
    );
    if (!matPlugins.length) {
      throw new Error(
        `Key is not found.Try to get the key "${pluginNames.join(" | ").trim()}`
      );
    }
    console.log(matPlugins, "matPlugins");

    ConfigService[action](this.isDefault, matPlugins); // 尽力过check , action必为 get or set
  }
  #error() {
    const complete = `${commandService.main}${ConfigController.key} ${this.args.join(" ")}`;
    const example = commandService.subs[ConfigController.key].examples
      .join(" | ")
      .trim();
    const msg = `Error command. Expected "${example}", got "${complete}".`;
    throw new Error(msg);
  }
}
