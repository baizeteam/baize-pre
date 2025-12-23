import type { CNPM, NPM, PNPM, YARN } from '@/const/manager.const'

export type TYPE_MANAGER_NAME
  = | typeof NPM
    | typeof YARN
    | typeof PNPM
    | typeof CNPM
