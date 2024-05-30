import readlineSync from "readline-sync"
import fs from "fs"
import path from "path"
import { InstallStore } from "../utils/Storage.mjs"
import Commands from "../common/Commands.mjs"
import Tool from "../utils/Tool.mjs"
import Pkg from "../utils/Pkg.mjs"

const tool = new Tool()
const pkg = new Pkg()
const installStore = new InstallStore()
const commands = new Commands()
class Config {
  constructor() {
    this.command = "config"
    this.isDefault = false // default状态
    this.args = []
    this.list = []
    this.keys = []
    this.installs = installStore.get()
    this.plugins = installStore.getPlugins()
  }
  init(args) {
    this.args = args
    try {
      this.#check()
    } catch (e) {
      return tool.error(e)
    }
    this[this.action]() // get or set, 此时arg[1]必有
  }
  get() {
    const reduceList = this[this.isDefault ? "installs" : "list"].map((item) => ({
      name: item.plugin,
      config: JSON.stringify(item.config.json)
    }))
    if (this.isDefault) {
      this.isDefault = false
    }
    return console.log(reduceList)
  }
  set() {
    // set default的判断
    if (this.isDefault) {
      const answer = readlineSync.question(
        "Would you want to set default config ? (y/n)"
      )
      if (answer.toLowerCase() !== "n") {
        try {
          installStore.reset()
          tool.success("Successfully.")
        } catch (e) {
          tool.error("Error: " + e)
        }
      } else {
        tool.warn("Cancel to set.")
      }
      this.isDefault = false
    } else {
      const keyStr = this.keys.join(",")
      // console.log(keyStr, 'keyStr')
      const answer = readlineSync.question(
        "Would you want to set " + keyStr + " form your local files ? (y/n)"
      )
      if (answer.toLowerCase() !== "n") {
        this.list.forEach((item) => {
          const filepath = path.join(pkg.dirPath, item.config.file)
          try {
            const file = fs.readFileSync(filepath, "utf-8")
            // console.log(file,'file')
            installStore.setConfig(item.plugin, file)
            tool.success("Successfully.")
          } catch (e) {
            return tool.error("Error: read your local file failed.")
          }
        })
      } else {
        tool.warn("Cancel to set.")
      }
    }
  }
  #error() {
    const complete =
      '"' + commands.main + this.command + " " + this.args.join(" ") + '"'
    const example = commands.resolve()[this.command].examples.join(" | ")
    const msg = "Error command. Expected " + example + " , got " + complete
    throw new Error(msg)
  }
  #check() {
    if (!this.args.length) return this.#error()
    if (this.args.length > 3) return this.#error(true)
    this.action = this.args[0].trim() // get of set
    if (this.action !== "get" && this.action !== "set") return this.#error()
    if (this.action === "get" || this.action === "set") {
      // console.log(this.action, this.args,'args')
      if (!this.args[1]) return this.#error()
      if (this.args[1] === installStore.default.key) {
        return (this.isDefault = true)
      }
      const keys = this.args.slice(1)
      const matInstall = this.installs.filter((item) =>
        keys.includes(item.plugin)
      )
      if (!matInstall.length) {
        throw new Error(
          "Key is not found." +
            "Try to get 【" +
            this.plugins.join(" | ") +
            "】"
        )
      }
      this.list = matInstall
      this.keys = keys
    }
  }
}

const config = new Config()
export default config.init.bind(config)
