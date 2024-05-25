import fs from "fs"
import path from "path"
import Tool from "./Tool.mjs"

const tool = new Tool()
// 用户的package.json
class Pkg {
  constructor() {
    const dirPath = process.cwd() // 用户根路径
    this.path = path.join(dirPath, "package.json")
    this.dirPath = dirPath
  }
  get() {
    const defaultInfo = {
      scripts: {}
    }
    if (!fs.existsSync(this.path)) {
      const filepath = this.path
      tool.writeJSONFileSync(filepath, defaultInfo)
      return defaultInfo
    }
    // 一定存在，且类型是字符串
    let infoStr = fs.readFileSync(this.path, "utf-8")
    let info
    try {
      info = JSON.parse(infoStr)
      if (!tool.isObject(info) || !tool.isObject(info.scripts)) {
        this.update(defaultInfo)
        return defaultInfo
      }
      // 能通过检测的原始info
      return info
    } catch (e) {
      // 如果json转换失败, 根本不可能是对象，直接给默认值
      this.update(defaultInfo)
      return defaultInfo
    }
  }
  update(content) {
    const filepath = this.path
    tool.writeJSONFileSync(filepath, content)
  }
}

export default Pkg
