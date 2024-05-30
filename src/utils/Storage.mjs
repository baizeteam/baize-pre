import * as path from "path"
import fs from "fs"
import Tool from "./Tool.mjs"

const tool = new Tool()

class Storage {
  constructor() {
    const rootPath = tool.node._root
    this.path = path.join(rootPath, "storage.json")
    this.default = {
      path: path.join(rootPath, "storage.default.json"),
      key: 'default'
    }
    // console.log(this.path,'Storage path')
  }
  getByPath(filepath) {
    try {
      if (!fs.existsSync(filepath)) return new Error("Error json path")
      return JSON.parse(fs.readFileSync(filepath, "utf-8"))
    } catch (e) {
      throw new Error("Error: " + e)
    }
  }
  get() {
    return this.getByPath(this.path)
  }
  update(key, content) {
    // 不要提供全量更改
    const filepath = this.path
    const info = this.get()
    if (!info[key]) throw new Error("Error at Storage.update")
    info[key] = content
    tool.writeJSONFileSync(filepath, info)
  }
}


const storage = new Storage()

export class InstallStore {
  constructor() {
    this.key = 'installs'
    this.key1 = 'gitignore'
    this.default = storage.default
  }
  getPlugins() {
    const info = storage.get()
    return info[this.key].map((item) => item.plugin)
  }

  getGitignore(){
    const info = storage.get()
    return info[this.key1]
  }

  get() {
    const info = storage.get()
    return info[this.key]
  }
  reset() {
    const defaultInfo = storage.getByPath(storage.default.path)
    storage.update(this.key, defaultInfo[this.key])
    storage.update(this.key1, defaultInfo[this.key1])
  }
  // single set
  setConfig(plugin, file) {
    if(plugin === this.key1) return storage.update(this.key1, file)
    const installs = this.get()
    installs.forEach((item) => {
      if (item.plugin === plugin) item.config.json = file
    })
    storage.update(this.key, installs)
  }
}

