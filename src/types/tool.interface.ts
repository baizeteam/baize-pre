export interface ToolInstance {
  isObject: (obj: any) => boolean
  formatJSON: (o: any) => string
  writeJSONFileSync: (path: string, content: any) => void
  execSync: (exec: string) => void
}
