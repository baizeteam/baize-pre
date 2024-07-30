import fsExtra from "fs-extra";
import { execSync } from "child_process";
import { ToolInstance } from "@/instance/tool.instance";

class ToolService implements ToolInstance {
  isObject(obj: any): boolean {
    return Object.prototype.toString.call(obj) === "[object Object]";
  }

  formatJSON(content: any) {
    return JSON.stringify(content, null, 2);
  }
  writeJSONFileSync(path: string, content: any): void {
    fsExtra.writeFileSync(path, this.formatJSON(content));
  }

  execSync(exec: string): void {
    execSync(exec, { stdio: "inherit" });
  }
}

export const toolService: ToolInstance = new ToolService();
