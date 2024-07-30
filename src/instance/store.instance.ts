import { TYPE_STORE_INFO } from "@/type/store.type";

export interface StoreInstance {
  readonly curPath: string;
  get(): TYPE_STORE_INFO;
  getByPath(filename: string): TYPE_STORE_INFO;
  update(key: string, content: Object): void;
}
