import fsExtra from "fs-extra";
import { join } from "path";
import { toolService } from "@/service/tool.service";
import { PackageInstance } from "@/instance/package.instance";
import { ToolInstance } from "@/instance/tool.instance";
import { TYPE_PACKAGE_INFO } from "@/type/package.type";
import { nodeService } from "@/service/node.service";
import process from "process";

export class PackageService implements PackageInstance {
  public readonly script: string = "scripts";
  public readonly curPath: string;
  public readonly curDir: string;
  private toolService: ToolInstance = toolService;

  constructor(isUser: boolean) {
    // 需要识别的是用户的根目录，还是自身的
    this.curDir = isUser ? process.cwd() : nodeService.root;
    this.curPath = join(this.curDir, "package.json");
  }
  get(): TYPE_PACKAGE_INFO {
    const defaultInfo: TYPE_PACKAGE_INFO = {
      scripts: {},
      devDependencies: {},
      dependencies: {}
    };
    let info;
    if (fsExtra.existsSync(this.curPath)) {
      try {
        const infoJSON = fsExtra.readFileSync(this.curPath, "utf-8");
        info = JSON.parse(infoJSON);
        // console.log("识别成功")
      } catch (_) {
        // console.log("识别失败")
        info = defaultInfo;
      }
      if (
        !this.toolService.isObject(info) ||
        !this.toolService.isObject(info[this.script])
      ) {
        // console.log("到这了")
        info = defaultInfo;
      }
      // console.log(info, "info return")
      return info;
    }

    this.toolService.writeJSONFileSync(this.curPath, defaultInfo);
    return defaultInfo;
  }

  remove(key: string, isScript: boolean = false): void {
    const info = this.get();
    if (!isScript) {
      if (info[key] === undefined) {
        throw new Error(`Internal Error: the key of '${key}' does not exist.`);
      }
      delete info[key];
    } else {
      if (
        !this.toolService.isObject(info[this.script]) ||
        info[this.script][key] === undefined
      ) {
        throw new Error(
          `Internal Error: the key of '${key}' does not exist in scripts.`
        );
      }
      delete info[this.script][key];
    }

    this.toolService.writeJSONFileSync(this.curPath, info);
  }

  update(key: string, content: Object): void {
    const info = this.get();
    if (key === this.script) {
      info[this.script] = { ...info[this.script], ...content };
    } else {
      info[key] = content;
    }
    this.toolService.writeJSONFileSync(this.curPath, info);
  }
}
