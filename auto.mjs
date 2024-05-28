import { fileURLToPath } from "url"
import { dirname } from "path"
import * as path from "path"
import fs from "fs";

const _filename = fileURLToPath(import.meta.url)
const _dirname = dirname(_filename)

const unlink = function (filepath){
    if(fs.existsSync(filepath)){
        fs.unlink(filepath, function (e){
            if(e) console.log('删除' + filepath + '错误')
        })
    }else{
        console.log('文件不存在：', filepath)
    }
}

const list = [
    '.idea',
    '.vscode',
    '.husky',
    'src',
    '.gitignore',
    '.prettierrc',
    'nodemon.json',
    'rollup.config.js'
]

for (let item of list){
    const filepath = path.join(_dirname, item)
    unlink(filepath)
}

console.log('done')
