#!/usr/bin/env node
import { program } from "commander"
import * as fs from "fs";
import logger from "./common/logger.mjs";
import commands,{mainCommand} from "./common/commands.mjs"
import execs from "./exec/index.mjs";
const pkg = JSON.parse(fs.readFileSync('./package.json','utf-8'))

function main() {
  // 设置命令在前，选项在后
  program.version(mainCommand.split(' ')[0] +'@' + pkg.version).usage('<command> [option]')
  for (let key in commands) {
    const { alias, description } = commands[key]
    program
      .command(key) // 注册命令
      .alias(alias) // 配置命令别名
      .description(description) // 配置命令描述
      .action(   function (name, {args}) {
          if (key === "*") {
              // 除了上述的命令，其他统统匹配到这里
              return  logger.error(description)
          }
        // console.log(process.cwd())
        console.log(key,'key')
        execs[key](args)
      })
  }

  // 最基础的一行，必须要解析
  program.parse(process.argv)
}

main()
