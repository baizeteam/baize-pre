import { program } from "commander"
import * as path from "path"
import pkg from "../package.json" assert { type: "json" }
import logger from "./common/logger.mjs"

console.log(pkg.version, "pkg")
//
// function main() {
//   // 设置命令在前，选项在后
//   program.usage("<command> [options]")
//   for (let key in commands) {
//     const { alias, description } = commands[key]
//     program
//       .command(key) // 注册命令
//       .alias(alias) // 配置命令别名
//       .description(description) // 配置命令描述
//       .action(function () {
//         if (key === "*") {
//           // 除了上述的命令，其他统统匹配到这里
//           logger.error(description)
//         } else {
//           // 先预处理用户的package.json，避免一些错误
//           new UserPackageJson()
//           // 直接加载对应的命令，这里要求命令名和commands的文件名匹配
//           require(path.join(__dirname, "commands", key))
//         }
//       })
//   }
//
//   // 监听用户的help事件, 这种排除在commands之外，是基建命令
//   program.on("--help", function () {
//     for (let key in commands) {
//       commands[key].examples.forEach((s) => console.log(s))
//     }
//   })
//
//   // parse不能多次调用，不然n次解析package.json文件，node会认为包信息文件更改，会n此重载，命令也就会n此执行
//   program.version(packageJson.version, "-v").parse(process.argv)
//
//   // 如果用户未传入任何副命令或参数，直接执行 --help
//   if (!program.args.length) {
//     program.help()
//   }
// }
//
// main()
