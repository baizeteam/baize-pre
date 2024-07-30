import { join } from "path";
import fsExtra from "fs-extra";
import { toolService } from "@/service/tool.service";
import { StoreInstance } from "@/instance/store.instance";
import { ToolInstance } from "@/instance/tool.instance";
import { NodeInstance } from "@/instance/node.instance";
import { nodeService } from "@/service/node.service";
import { TYPE_STORE_INFO } from "@/type/store.type";

export class StoreService implements StoreInstance {
  private readonly nodeService: NodeInstance = nodeService;
  private readonly toolService: ToolInstance = toolService;
  private readonly curDir: string = join(this.nodeService.root);
  public readonly curPath: string;

  constructor(isUser: boolean) {
    this.curPath = join(
      this.curDir,
      `store.${isUser ? "user" : "default"}.json`
    );
  }

  getByPath(filepath: string): TYPE_STORE_INFO {
    try {
      if (!fsExtra.existsSync(filepath)) throw new Error("Error json path");
      return JSON.parse(fsExtra.readFileSync(filepath, "utf-8"));
    } catch (e) {
      throw new Error("Error: " + e);
    }
  }

  get(): TYPE_STORE_INFO {
    return this.getByPath(this.curPath);
  }
  update(key: string, content: Object): void {
    const filepath = this.curPath;
    const info = this.get();
    if (!info || !info[key]) throw new Error("Error at Storage.update");
    info[key] = content;
    this.toolService.writeJSONFileSync(filepath, info);
  }
  // single set
}
