import { HUSKY, PRETTIER, TS } from "@/const/plugin.const";

export type TYPE_PLUGIN_NAME = typeof TS | typeof HUSKY | typeof PRETTIER;

export type TYPE_PLUGIN_ITEM = {
  name: TYPE_PLUGIN_NAME;
  config: { file: string; json: object };
  dev: boolean;
  pkgInject: object;
};
