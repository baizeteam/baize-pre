import type { ToolInstance } from '@/types/tool.interface'
import { execSync } from 'node:child_process'
import fsExtra from 'fs-extra'

class ToolService implements ToolInstance {
  isObject(obj: object): boolean {
    return Object.prototype.toString.call(obj) === '[object Object]'
  }

  formatJSON(content: object) {
    return JSON.stringify(content, null, 2)
  }

  writeJSONFileSync(path: string, content: object): void {
    fsExtra.writeFileSync(path, this.formatJSON(content))
  }

  execSync(exec: string): void {
    execSync(exec, { stdio: 'inherit' })
  }
}

export const toolService: ToolInstance = new ToolService()
