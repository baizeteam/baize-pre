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
    // 添加一个私有变量来存储缓存
    this._cache = null
  }
  // 私有方法，用于从文件系统中读取并解析package.json
  parse() {
    if (fs.existsSync(this.path)) {
      let infoStr = fs.readFileSync(this.path, "utf-8")
      let info
      try {
        info = JSON.parse(infoStr)
        // 确保info和scripts都是对象
        if (!tool.isObject(info) || !tool.isObject(info.scripts)) {
          throw new Error("Invalid package.json format")
        }
        return info
      } catch (e) {
        // 如果json转换失败, 则返回null
        return null
      }
    }
    return null
  }
  get() {
    if (this._cache) {
      return this._cache
    }
    const defaultInfo = {
      scripts: {}
    }
    // 读取并解析package.json，如果文件不存在或格式不正确，则写入默认值
    let info = this.parse()
    if (!info) {
      tool.writeJSONFileSync(this.path, defaultInfo)
      info = defaultInfo
    }
    // 更新缓存
    this._cache = info
    // 返回解析后的info
    return info
  }
  update(key, content) {
    // 不要提供全量更改
    const filepath = this.path
    const info = this.get() // 这里会用到缓存，但如果key是'scripts'且需要合并，则缓存可能不是最新的
    const SCRIPTS = "scripts"

    if (key === SCRIPTS) {
      info[SCRIPTS] = { ...info[SCRIPTS], ...content }
    } else {
      info[key] = content
    }
    // 清除缓存，因为package.json已经被修改了
    this._cache = null
    tool.writeJSONFileSync(filepath, info)
  }
}

export default Pkg
