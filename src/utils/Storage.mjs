import * as path from "path"
import fs from "fs"
import Tool from "./Tool.mjs"

const tool = new Tool()

class Storage{
  constructor() {
    const rootPath = tool.node._root
    this.path = path.join(rootPath, "storage.json")
    this.defaultPath = path.join(rootPath, 'storage.default.json')
    // console.log(this.path,'Storage path')
  }
  getByPath(filepath){
    try {
      if (!fs.existsSync(filepath)) return new Error("Error json path")
      return JSON.parse(fs.readFileSync(filepath, "utf-8"))
    } catch (e) {
      throw new Error("Error: " + e)
    }
  }
  get(){
    return this.getByPath(this.path)
  }
    update(key, content) {
    // 不要提供全量更改
    const filepath = this.path
      const info = this.get()
      if(!info.key) throw new Error('Error at Storage.update')
      info[key] = content
    tool.writeJSONFileSync(filepath, info)
  }
}

const storage = new Storage()

export class InstallStore{
  constructor() {
    // 恢复默认设置的key
    this.defaultKey = 'default'
  }
  getPlugins(){
    const info = storage.get()
    return info.installs.map(item=> item.plugin)
  }

  get(){
    const info = storage.get()
    return info.installs
  }
  reset(){
    const defaultInfo = storage.getByPath(storage.defaultPath)
    storage.update('installs', defaultInfo.installs)
  }
  // single set
  setConfig(plugin, file){
    const installs= this.get()
    installs.forEach(item => {
      if(item.plugin === plugin){
        item.config.json = file
      }
    })
    storage.update('installs', installs)
  }
}
