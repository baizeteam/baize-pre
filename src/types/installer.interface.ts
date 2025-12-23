import type { TYPE_PLUGIN_ITEM } from '@/types/plugin.types'

export interface InstallerInstance {
  chooseManager: () => Promise<void>
  install: (plugins: TYPE_PLUGIN_ITEM[]) => Promise<void>
  choose: () => Promise<void>
}
