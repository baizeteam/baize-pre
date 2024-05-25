const YARN = "yarn"
const PNPM = "pnpm"
const NPM = "npm"

class Mgr {
  constructor(mgr = PNPM) {
    this.mgr = mgr
    this.yarn = YARN
    this.pnpm = PNPM
    this.npm = NPM
    this.mgrList = [PNPM, YARN, NPM]
  }
}

export default Mgr
