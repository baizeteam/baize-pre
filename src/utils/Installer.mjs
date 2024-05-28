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

class Installer {
  constructor() {
    // 需要一个packageManger工具
    this.mgr = mgr.mgr
    this.pkg = new Pkg()
    this.node = tool.node
  }

  #handlePkg(pkg) {
    // console.log(pkg, "有注入命令")
    const info = this.pkg.get()
    console.log(info, "get info", pkg)
    for (let key in pkg) {
      // 更新用户json
      this.pkg.update(key, pkg[key])
    }
  }

  #checkGit() {
    const gitPath = path.join(this.pkg.dirPath, ".git")
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
    const gitignore = ".gitignore"
    const gitignorePath = path.join(this.pkg.dirPath, gitignore)
    if (!fs.existsSync(gitignorePath)) {
      try {
        fs.writeFileSync(gitignorePath, "git")
      } catch (e) {
        tool.error(gitignore)
      }
    }
  }
  #handleInstall(pkgName, dev = false, version = null) {
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
      tool.error("Failed to Install " + pkgName + " : ")
      console.log(e) // 承接上一行错误，但不要颜色打印
    }
  }
  #handleConfig(config) {
    const filepath = path.join(this.pkg.dirPath, config.file)
    // console.log(config, "有注入配置", filepath)
    try {
      const { json } = config
      if (typeof json === "object") tool.writeJSONFileSync(filepath, json)
      else fs.writeFileSync(filepath, json)
      // console.log(filepath,'filepath')
    } catch (e) {
      // console.log(filepath,'失败 filepath')
      return tool.error("Error: Inject config error in handleConfig.")
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
      // 有需要合并的脚本
      pkg && this.#handlePkg(pkg)
      // 有需要write的config文件
      config && this.#handleConfig(config)
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
