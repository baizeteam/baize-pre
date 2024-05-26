import * as path from "path"
import fs from "fs"
import Tool from "./Tool.mjs"

const tool = new Tool()

class Storage {
  constructor() {
    const rootPath = tool.node._root
    this.path = path.join(rootPath, "storage.json")
  }
  #getInfo(){
    try {
      if (!fs.existsSync(this.path)) return  new Error("Error storage.json path")
      return JSON.parse(fs.readFileSync(this.path, "utf-8"))
    } catch (e) {
      throw new Error("Error: " + e)
    }
  }
  getPlugins(){
    const info = this.#getInfo()
    return info.installs.map(item=> item.plugin)
  }

  getInstalls(){
    const into = this.#getInfo(this.path)
    return into.installs
  }
  update(content) {
    // 不要提供全量更改
    const filepath = this.path
    tool.writeJSONFileSync(filepath, content)
  }
}

export default Storage
