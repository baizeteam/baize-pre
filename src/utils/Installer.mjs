import fs from "fs"
import path from "path"
import { InstallStore } from "./Storage.mjs"
import inquirer from "inquirer"
import Mgr from "./Mgr.mjs"
import Tool from "./Tool.mjs"
import Pkg from "./Pkg.mjs"

const tool = new Tool()
const installStore = new InstallStore()
const mgr = new Mgr()
const userPkg = new Pkg()

class Installer {
  constructor() {
    // 需要一个packageManger工具
    this.mgr = mgr.mgr
    this.node = tool.node
  }

  #handlePkg(pkg) {
    userPkg.get()
    // console.log(pkg, "有注入命令")
      for (let key in pkg) {
        // 更新用户json
        userPkg.update(key, pkg[key])
      }
  }

  #checkGit() {
    userPkg.get()
    const gitPath = path.join(userPkg.dirPath, ".git")
    // console.log(gitPath,'gitpath')
    if (!fs.existsSync(gitPath)) {
      //  最好用 'dev' 作为默认分支名
      //  master就算不是默认分支时，都是不可删的
      tool.execSync("git init -b dev")
      // 更改git默认不区分大小写的配置
      // 如果A文件已提交远程，再改为小写的a文件，引用a文件会出现本地正确、远程错误，因为远程还是大A文件)
      tool.execSync("git config core.ignorecase false")
    }
  }
  #checkGitignore() {
    userPkg.get()
    const gitignore = installStore.getGitignore()
    const filepath = path.join(userPkg.dirPath, gitignore.file)
    if (!fs.existsSync(filepath)) {
      try {
        fs.writeFileSync(filepath, gitignore.json)
      } catch (e) {
        tool.error("Error to wrote " + filepath)
      }
    }
  }
  #handleInstall(pkgName, dev = false, version = null) {
    /** 必须在install前刷新一遍pkg的info,避免npm 安装时写入和我们的写入顺序冲掉了 */
    userPkg.get()
    const { mgr } = this
    let exec = mgr === "yarn" ? mgr + " add " : mgr + " install "
    dev && (exec += " -D ")
    exec += pkgName
    version && (exec += "@" + version)
    try {
      // 捕获安装错误
      tool.warn("Installing " + pkgName + " ... ")
      tool.execSync(exec)
      tool.success("Installed " + pkgName + " successfully. ")
    } catch (e) {
      tool.error("Error: install " + pkgName + " : ")
      console.log(e) // 承接上一行错误，但不要颜色打印
    }
  }
  #handleUninstall(pkgName) {
    userPkg.get()
    const { mgr } = this
    let exec = mgr === "yarn" ? mgr + " remove " : mgr + " uninstall "
    exec += pkgName
    try {
      // 捕获安装错误
      tool.warn("Uninstalling " + pkgName + " ... ")
      tool.execSync(exec)
      tool.success("Uninstalled " + pkgName + " successfully. ")
    } catch (e) {
      tool.error("Error: uninstall " + pkgName + " : ")
      console.log(e) // 承接上一行错误，但不要颜色打印
    }
  }
  #handleConfig(config) {
    userPkg.get()
    const filepath = path.join(userPkg.dirPath, config.file)
    // console.log(config, "有注入配置", filepath)
    try {
      const { json } = config
      if (typeof json === "object") tool.writeJSONFileSync(filepath, json)
      else fs.writeFileSync(filepath, json)
      // console.log(filepath,'filepath')
    } catch (e) {
      // console.log(filepath,'失败 filepath')
      return tool.error("Error: inject config error in handleConfig.")
    }
  }
  #checkHusky() {
    const HUSKY = "husky"
    // 这一个依赖.git
    this.#checkGit()
    this.#checkGitignore()
    // 如果node版本小于16，使用@8版本插件
    tool.execSync("npx " + HUSKY + " install")
    // console.log('checkhusky1')
    this.#handleInstall('lint-staged',true)
  }
  async install(installs) {
    // install前先选择安装工具
    await mgr.choose()
    this.mgr = mgr.mgr
    // console.log(installs,'installs')
    for (let item of installs) {
      const { plugin, config, dev, pkg } = item
      this.#handleInstall(
        plugin,
        dev,
        plugin === "husky" && this.node.versionPre < 16 ? 8 : null
      )
      // 顺序很重要，放最前面
      plugin === "husky" && this.#checkHusky()
      // // 有需要合并的脚本
      pkg && this.#handlePkg(pkg)
      // // 有需要write的config文件
      config && this.#handleConfig(config)
    }
  }
  async uninstall(installs){
    // 卸载插件以及插件配置文件，由于包管理工具机制，比如你用npm安装，用yarn卸载某项，yarn执行完毕会去安装全部插件
    // 如果用户的包管理工具不一致，用户自己选择的，不能怪我们
    await mgr.choose()
    this.mgr = mgr.mgr
    // console.log(installs, 'uninstall')
    for(let item of installs){
      const { plugin } = item
      this.#handleInstall(plugin)
      // 移除配置项

    }
  }
  async choose() {
    const questionKey = "key"
    const storagePlugins = installStore.getPlugins()
    const question = [
      {
        type: "checkbox",
        name: questionKey,
        message: "Choose the plugins what you want to install.",
        choices: storagePlugins,
        validate(answers) {
          if (!answers.length) return "You must choose at least one plugin."
          return true
        }
      }
    ]
    const answers = await inquirer.prompt(question)
    const installs = installStore.get()
    const matInstalls = installs.filter((item) =>
      answers[questionKey].includes(item.plugin)
    )
    await this.install(matInstalls)
  }
}

export default Installer
