import { fileURLToPath } from "url"
import { dirname } from "path"
import * as path from "path";
import chalk from "chalk";
import {execSync} from 'child_process'

const logger = function (type,s, bold){
    let color = 'yellow'
    if(type === 'success') color = 'green'
    else if(type === 'error') color = 'red'
    const handler = bold ? chalk.bold[color](s) : chalk[color](s)
    return console.log(handler)
}
class Tool{
    constructor() {
        const _filename = fileURLToPath(import.meta.url)
        const _dirname = dirname(_filename)
        const _root = path.join(_dirname, '..')
        this.node = {
            _filename,
            _dirname,
            _root
        }
    }
    execSync(exec){
        execSync(exec, {stdio: 'inherit'})
    }
    getFileExt(path){
        // 使用lastIndexOf()找到最后一个'.'的位置
        const dotIndex = path.lastIndexOf('.');
        // 如果'.'不存在于路径中，则返回空字符串
        if (dotIndex === -1) throw new Error('The filepath "' + path + ' " without extension.')
        // 使用slice()方法获取从最后一个'.'到字符串末尾的部分
        return path.slice(dotIndex + 1);
    }
    success(s, bold) {
        return logger('success', s, bold)
    }
    warn(s, bold) {
        return logger('warn', s, bold)
    }
    error(s, bold) {
        return logger('error', s, bold)
    }
}

export default Tool