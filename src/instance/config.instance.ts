export interface ConfigInstance {
  get(isDefault: boolean, matPlugins: any[]): any;
  set(isDefault: boolean, matPlugins: any[]): void;
}
