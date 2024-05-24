import fs from "fs";
import path from "path";

// 用户的package.json
class Pkg{
    constructor() {
        const dirPath = process.cwd() // 用户根路径
        this.path = path.join( dirPath, 'package.json')
        this.dirPath = dirPath
    }
    get(){
        try {
            if(!fs.existsSync(this.path)) throw new Error('Error package.json path')
            let info = JSON.parse(fs.readFileSync(this.path, 'utf-8'))
            function isObject (obj){
               return  Object.prototype.toString.call(obj) === '[object Object]'
            }
            // 如果阅读的过程中，防止用户删除pkg, 如果不为对象设为{}
            !isObject(info) || !isObject(info.script) && (info = {script : {}})
            this.update(info)
            return info
        }catch (e){
            throw new Error('Error: '+e)
        }
    }
    update(content){
        this.get(this.path) // 确保文件存在
        fs.writeFileSync(this.path, JSON.stringify(content, null, 2))
    }
}

export default Pkg