import { TYPE_PLUGIN_ITEM } from "@/type/plugin.type";

export interface InstallerInstance {
  chooseManager(): Promise<void>;
  install(plugins: TYPE_PLUGIN_ITEM[]): Promise<void>;
  uninstall(plugins: TYPE_PLUGIN_ITEM[]): Promise<void>;
  choose(): Promise<void>;
}
