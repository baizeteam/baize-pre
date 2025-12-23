import type { PackageInstance } from '@/types/package.interface'
import type { TYPE_PACKAGE_INFO } from '@/types/package.types'
import type { ToolInstance } from '@/types/tool.interface'
import { join } from 'node:path'
import process from 'node:process'
import fsExtra from 'fs-extra'
import { nodeService } from '@/service/node.service'
import { toolService } from '@/service/tool.service'

export class PackageService implements PackageInstance {
  public readonly script: string = 'scripts'
  public readonly curPath: string
  public readonly curDir: string
  private toolService: ToolInstance = toolService

  constructor(isUser: boolean) {
    // 需要识别的是用户的根目录，还是自身的
    this.curDir = isUser ? process.cwd() : nodeService.root
    this.curPath = join(this.curDir, 'package.json')
  }

  get(): TYPE_PACKAGE_INFO {
    const defaultInfo: TYPE_PACKAGE_INFO = {
      scripts: {},
      devDependencies: {},
      dependencies: {},
    }
    let info
    if (fsExtra.existsSync(this.curPath)) {
      try {
        const infoJSON = fsExtra.readFileSync(this.curPath, 'utf-8')
        info = JSON.parse(infoJSON)
        // console.log("识别成功")
      }
      catch (_unused) {
        // console.log("识别失败")
        info = defaultInfo
      }
      if (
        !this.toolService.isObject(info)
        || !this.toolService.isObject(info[this.script])
      ) {
        // console.log("到这了")
        info = defaultInfo
      }
      // console.log(info, "info return")
      return info
    }

    this.toolService.writeJSONFileSync(this.curPath, defaultInfo)
    return defaultInfo
  }

  remove(key: string, isScript: boolean = false): void {
    const info = this.get()
    if (!isScript) {
      if (info[key] === undefined) {
        throw new Error(`Internal Error: the key of '${key}' does not exist.`)
      }
      delete info[key]
    }
    else {
      if (
        !this.toolService.isObject(info[this.script])
        || info[this.script][key] === undefined
      ) {
        throw new Error(
          `Internal Error: the key of '${key}' does not exist in scripts.`,
        )
      }
      delete info[this.script][key]
    }

    this.toolService.writeJSONFileSync(this.curPath, info)
  }

  update(key: string, content: object): void {
    const info = this.get()
    if (key === this.script) {
      info[this.script] = { ...info[this.script], ...content }
    }
    else if (key === 'devDependencies' || key === 'dependencies') {
      // 合并依赖，而不是覆盖
      info[key] = {
        ...(info[key] as Record<string, string>),
        ...(content as Record<string, string>),
      }
    }
    else {
      info[key] = content
    }
    this.toolService.writeJSONFileSync(this.curPath, info)
  }
}
