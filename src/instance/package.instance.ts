import { TYPE_PACKAGE_INFO } from "@/type/package.type";

export interface PackageInstance {
  script: string;
  curDir: string;
  curPath: string;
  get(): TYPE_PACKAGE_INFO;
  remove(key: string, isScript?: boolean): void;
  update(key: string, content: Object): void;
}
