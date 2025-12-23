import type { TYPE_PACKAGE_INFO } from '@/types/package.types'

export interface PackageInstance {
  script: string
  curDir: string
  curPath: string
  get: () => TYPE_PACKAGE_INFO
  remove: (key: string, isScript?: boolean) => void
  update: (key: string, content: object) => void
}
