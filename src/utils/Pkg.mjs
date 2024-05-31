import fs from "fs"
import path from "path"
import Tool from "./Tool.mjs"

const tool = new Tool()
const SCRIPTS = 'scripts'
// 用户的package.json
class Pkg {
  constructor() {
    const dirPath = process.cwd() // 用户根路径
    this.path = path.join(dirPath, "package.json")
    this.dirPath = dirPath
    this.SCRIPTS = SCRIPTS
  }
  // 私有方法，用于从文件系统中读取并解析package.json
  get() {
    const defaultInfo = {
      [SCRIPTS]: {}
    }
    // 读取并解析package.json，如果文件不存在或格式不正确，则写入默认值
    let info
    if (fs.existsSync(this.path)) {
      const infoStr = fs.readFileSync(this.path, "utf-8")
      try {
        info = JSON.parse(infoStr)
        // console.log(info, 'try里info')
      }catch (e){
        info = defaultInfo
      }
      if (!tool.isObject(info) || !tool.isObject(info[SCRIPTS])) {
        info = defaultInfo
      }
    }else{
      tool.writeJSONFileSync(this.path, defaultInfo)
      info = defaultInfo
    }
    // 返回解析后的info
    return info
  }
  delete(key, isScript = false){
    const info = this.get()
    if(!isScript){
      if(info[key] === undefined) {
        // 内部错误
        throw new Error('Internal Error: the key of ' + key + ' is not exists.')
      }
      delete info[key]
    }else{
      // 删除scripts中的键时
      if(tool.isObject(info[SCRIPTS]) && info[SCRIPTS][key] !== undefined){
        delete info[SCRIPTS][key]
      }else{
        throw new Error('Internal Error: the key of ' + key + ' is not exists.')
      }
    }

    const filepath = this.path
    return  tool.writeJSONFileSync(filepath, info)
  }
  update(key, content) {
    // console.log('userPkg update key:',key,", content:", content)
    // 不要提供全量更改
    const filepath = this.path
    const info = this.get()
    // TODO 看看这里逻辑是不是有问题
    if (key === SCRIPTS) {
      // console.log(info[SCRIPTS], content,'aaa')
      info[SCRIPTS] = { ...info[SCRIPTS], ...content }
    } else {
      info[key] = content
    }
    tool.writeJSONFileSync(filepath, info)
  }
}

export default Pkg
