import { fileURLToPath } from "url"
import { dirname } from "path"
import * as path from "path"
import fs from "fs";

const _filename = fileURLToPath(import.meta.url)
const _dirname = dirname(_filename)

const src = path.join(_dirname, 'storage.default.json')
if(fs.existsSync(src)){
    fs.unlink(src, function (e){
        if(e) throw e
        console.log('s')
    })
}else{
    console.log(src,'src')
}