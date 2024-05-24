import Tool from "./Tool.mjs";
import * as path from "path";
import fs from "fs";

class Storage{
    constructor() {
        const rootPath = new Tool().node._root
        this.path = path.join(rootPath, 'storage.json')
    }
    get(){
        try {
            if(!fs.existsSync(this.path)) throw new Error('Error storage.json path')
            return JSON.parse(fs.readFileSync(this.path, 'utf-8'))
        }catch (e){
            throw new Error('Error: '+e)
        }
    }
    update(content){
        // 不要提供全量更改
        this.get(this.path) // 确保文件存在
        fs.writeFileSync(this.path, JSON.stringify(content, null, 2))
    }
}

export default Storage