import fs from 'fs'
import {fileURLToPath} from 'url'
import  {dirname, join} from 'path'
const __dirname = dirname(fileURLToPath(import.meta.url));

// 定义源文件和目标文件的路径
const sourcePath = join(__dirname, 'store.default.json');
const destinationPath = join(__dirname, 'store.user.json');

fs.copyFileSync(sourcePath, destinationPath);
