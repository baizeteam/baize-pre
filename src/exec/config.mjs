import Storage from "../utils/Storage.mjs";
import Commands from "../common/Commands.mjs";
const storage = new Storage()
const commands = new Commands()
class Config{
  constructor() {
    this.command = 'config'
  }
  init(args){
    this.args = args
  }
  error(overflow){
    const complete = '"' + commands.main + this.command + ' ' + args.join(' ') + '"'
  }
}
async function config(args){
  const plugins = storage.getPlugins()
  const installs = storage.getInstalls()
  // const matInstalls = installs.filter(item=> args.includes(item.plugin))
  console.log(args,'arr')
  const action = args
}

const c = new Config()
export default c.init
