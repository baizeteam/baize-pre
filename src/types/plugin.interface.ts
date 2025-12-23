import type { TYPE_PLUGIN_ITEM, TYPE_PLUGIN_NAME } from '@/types/plugin.types'

export interface PluginInstance {
  getAll: () => TYPE_PLUGIN_NAME[]
  get: () => TYPE_PLUGIN_ITEM[]
  set: (pluginName: string, file: object) => void
}
