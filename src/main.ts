#!/usr/bin/env node
import { join } from "path";
import fsExtra from "fs-extra";
import { Command } from "commander";
import "source-map-support/register.js";
import { MainModule } from "@/main.module";

class Entry {
  constructor(private readonly mainModule: MainModule) {
    const localPkgPath = join(this.mainModule.nodeService.root, "package.json");
    const localPkgInfo = JSON.parse(
      fsExtra.readFileSync(localPkgPath, "utf-8")
    );
    const commandList = this.mainModule.commandService.subs;
    const program = new Command();
    program
      .version(`${localPkgInfo.name}@${localPkgInfo.version}`)
      .usage("<command> [option]");
    for (let key in commandList) {
      const { alias, description } = commandList[key];
      program
        .command(key) // 注册命令
        .alias(alias) // 自定义命令缩写
        .description(description) // 命令描述
        .action((options, { parent }) => {
          const subExecWord: string = parent.args[0];
          const modules = this.mainModule.getAll();

          for (let ModuleClass of modules) {
            if (subExecWord === ModuleClass.key) {
              new ModuleClass(parent.args.slice(1));
            }
          }

          // console.log(options, parent.args, "aaa")
        });
    }
    program.parse(process.argv);
  }
}

new Entry(new MainModule());
