import { fileURLToPath } from "url"
import { dirname } from "path"
import * as path from "path"
import chalk from "chalk"
import { execSync } from "child_process"
import fs from "fs"
import Commands from "../common/Commands.mjs"

const commands = new Commands()
const logger = function (type, s, bold) {
  let color = "yellow"
  if (type === "success") color = "green"
  else if (type === "error") color = "red"
  const handler = bold ? chalk.bold[color](s) : chalk[color](s)
  return console.log(handler)
}
class Tool {
  constructor() {
    this.initNode()
  }
  initNode() {
    const _filename = fileURLToPath(import.meta.url)
    const _dirname = dirname(_filename)
    const _root = path.join(_dirname, "..")
    const version = process.versions.node
    const versionPre = version.split(".")[0]
    this.node = {
      _filename,
      _dirname,
      _root,
      version,
      versionPre
    }
  }
  execSync(exec) {
    execSync(exec, { stdio: "inherit" })
  }
  isObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]"
  }
  writeJSONFileSync(path, content) {
    fs.writeFileSync(path, JSON.stringify(content, null, 2))
  }
  success(s, bold) {
    return logger("success", s, bold)
  }
  warn(s, bold) {
    return logger("warn", s, bold)
  }
  error(s, bold) {
    return logger("error", s, bold)
  }
  done(s) {
    this.success(commands.main + s + " done. ", true)
  }
}

export default Tool
