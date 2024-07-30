import { StoreService } from "@/service/store.service";
import { StoreInstance } from "@/instance/store.instance";
import { PluginInstance } from "@/instance/plugin.instance";

export class PluginService implements PluginInstance {
  public readonly normalKey = "installs";
  private readonly storeService: StoreInstance;
  constructor(isUser: boolean) {
    this.storeService = new StoreService(isUser);
  }
  getAll() {
    const info = this.storeService.get();
    // console.log(info, "info plugin.service");
    return info[this.normalKey].map((item) => item.name);
  }
  get() {
    const info = this.storeService.get();
    // console.log(info, "info");
    return info[this.normalKey];
  }
  // 这里都是调用store的crud
  reset() {
    const defaultInfo = this.storeService.getByPath(this.storeService.curPath);
    this.storeService.update(this.normalKey, defaultInfo[this.normalKey]);
  }
  set(pluginName: string, file: object) {
    const plugins = this.get();
    plugins.forEach((item) => {
      if (item.name === pluginName) {
        item.config.json = file;
      }
    });
    this.storeService.update(this.normalKey, plugins);
  }
}
