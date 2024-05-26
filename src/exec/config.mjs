import Storage from "../utils/Storage.mjs";

const storage = new Storage()

async function config(args){
  const plugins = storage.getPlugins()
  const installs = storage.getInstalls()
  // const matInstalls = installs.filter(item=> args.includes(item.plugin))
  console.log(args,'arr')
  const action = args
}

export default config
