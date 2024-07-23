import { fileURLToPath } from "url"
import { dirname } from "path"
import * as path from "path"
import fs from "fs";
import fsExtra from 'fs-extra'
import {execSync} from 'child_process'

const _filename = fileURLToPath(import.meta.url)
const _dirname = dirname(_filename)

const unlink = function (filepath){
    if(fs.existsSync(filepath)){
        try {
            fsExtra.removeSync(filepath)
        }catch (e){
            console.log('删除 ' + filepath + ' 错误')
        }
    }else{
        console.log('文件不存在：', filepath)
    }
}

const list = [
    "bin/build.cjs.map",
    '.idea',
    '.vscode',
    '.husky',
    'src',
    '.gitignore',
    '.prettierrc',
    'nodemon.json',
    'rollup.config.js',
    'package-lock.json',
    'pnpm-lock.yaml',
    'auto.mjs'
]

for (let item of list){
    const filepath = path.join(_dirname, item)
    unlink(filepath)
}

// 删除完撤回文件即可
execSync('npx nrm use npm')
execSync('npm publish')
console.log('done')
