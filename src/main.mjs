#!/usr/bin/env node
import path from "path"
import { program } from "commander"
import * as fs from "fs"
import Tool from "./utils/Tool.mjs"
import Commands from "./common/Commands.mjs"
import execs from "./exec/index.mjs"
// 这个配合打包插件，设置source-map,定位源码用的
import "source-map-support/register"

function main() {
  const tool = new Tool()
  const myPkgPath = path.join(tool.node._dirname, "..", "package.json")
  const myPkg = JSON.parse(fs.readFileSync(myPkgPath, "utf-8"))
  const commands = new Commands()
  const commandResolves = commands.resolve()
  // 设置命令在前，选项在后
  program.version("baize-pre" + "@" + myPkg.version).usage("<command> [option]")
  for (let key in commandResolves) {
    const { alias, description } = commandResolves[key]
    program
      .command(key) // 注册命令
      .alias(alias) // 配置命令别名
      .description(description) // 配置命令描述
      .action(function (name, { args }) {
        try {
          // 除了上述的命令，其他统统匹配到这里
          if (key === "*") return tool.error(description)
          return execs[key](args)
        } catch (e) {
          tool.error('Unrecognized commands "' + key + '".')
        }
      })
  }

  // 最基础的一行，必须要解析
  program.parse(process.argv)
}

main()
