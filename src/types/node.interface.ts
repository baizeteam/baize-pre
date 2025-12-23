export interface NodeInstance {
  readonly filename: string
  readonly dirname: string
  readonly root: string
  readonly versions: {
    preVersion: number
    fullVersion: string
  }
}
