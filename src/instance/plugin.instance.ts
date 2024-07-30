import { TYPE_PLUGIN_ITEM, TYPE_PLUGIN_NAME } from "@/type/plugin.type";

export interface PluginInstance {
  getAll(): TYPE_PLUGIN_NAME[];
  get(): TYPE_PLUGIN_ITEM[];
  set(pluginName: string, file: object): void;
}
