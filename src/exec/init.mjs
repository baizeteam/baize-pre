import Installer from "../utils/Installer.mjs";
import Mgr from "../utils/Mgr.mjs";

const mgr = new Mgr()
async function init() {
  await mgr.choose()
  const installer = new Installer(mgr.mgr)
  // await installer
}

export default init
