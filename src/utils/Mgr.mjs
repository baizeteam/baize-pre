import inquirer from 'inquirer'
import Tool from "./Tool.mjs";

const YARN = "yarn"
const PNPM = "pnpm"
const NPM = "npm"
const tool = new Tool()
class Mgr {
  constructor(mgr = PNPM) {
    this.mgr = mgr
    this.yarn = YARN
    this.pnpm = PNPM
    this.npm = NPM
    this.mgrList = [PNPM, YARN, NPM]
  }
  async choose(){
    const questionKey = 'manager'
    const question = [
      {
        type: 'list',
        name: questionKey,
        message: 'Which package manager to use?',
        choices: this.mgrList
      }
    ]
    const answer = await inquirer.prompt(question)
    this.mgr = answer[questionKey]
    const {mgr, pnpm} = this
    tool.success('You have chosen: ' + mgr)
    const nodePreV = tool.node.versionPre
    const nodeV = tool.node.version
    if(nodePreV < 16 && mgr === pnpm){
      tool.error('Sorry, your node version is not support to ' + pnpm)
      return tool.error('Expected >= 16, but got ' + nodeV)
    }
  }
}

export default Mgr
