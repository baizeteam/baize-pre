import Tool from "./Tool.mjs"
import Pkg from "./Pkg.mjs"
import fs from "fs"
import path from "path"

const tool = new Tool()
class Installer {
  constructor(installs) {
    // 需要一个packageManger工具
    this.mgr = "pnpm"
    this.pkg = new Pkg()
    this.node = tool.node
    this.pre(installs)
  }
  checkGit(dirPath) {
    const gitPath = path.join(dirPath, ".git")
    if (!gitPath) {
      //  最好用 'dev' 作为默认分支名
      //  master就算不是默认分支时，都是不可删的
      tool.execSync("git init -b dev")
      // 更改git默认不区分大小写的配置
      // 如果A文件已提交远程，再改为小写的a文件，引用a文件会出现本地正确、远程错误，因为远程还是大A文件)
      tool.execSync("git config core.ignorecase false")
    }
  }
  checkGitignore(dirPath) {
    const gitignore = ".gitignore"
    const gitignorePath = path.join(dirPath, gitignore)
    if (!fs.existsSync(gitignorePath)) {
      try {
        fs.writeFileSync(gitignorePath, "git")
      } catch (e) {
        tool.error(gitignore)
      }
    }
  }
  handlePkg(pkg) {
    console.log(pkg, "有注入命令")
    const info = this.pkg.get()
    for (let key in pkg) {
      // 合并scripts内部属性
      if (key === "scripts") {
        info.scripts = { ...info.scripts, ...pkg.scripts }
      } else {
        info[key] = pkg[key]
      }
    }
    // 更新用户json
    this.pkg.update(info)
  }
  handleInstall(pkgName, dev = false, version = null) {
    const { mgr } = this
    let exec = mgr === "yarn" ? mgr + " add" : mgr + " install"
    dev && (exec += " -D")
    version && (exec += "@" + version)
    try {
      // 捕获安装错误
      tool.execSync(exec)
    } catch (e) {
      tool.error("Failed to Install " + pkgName + " : ")
      console.log(e) // 承接上一行错误，但不要颜色打印
    }
  }
  handleConfig(config) {
    const filepath = path.join(this.pkg.dirPath, config.file)
    console.log(config, "有注入配置", filepath)
    try {
      const { json } = config
      if (typeof json === "object") tool.writeJSONFileSync(filepath, json)
      else fs.writeFileSync(filepath, json)
    } catch (e) {
      return tool.error("注入配置失败")
    }
  }
  checkHusky(dev) {
    const HUSKY = "husky"
    // 这一个依赖.git
    const { dirPath } = this.pkg
    this.checkGit(dirPath)
    this.checkGitignore(dirPath)
    // 如果node版本小于16，使用@8版本插件
    const nodePreVersion = this.node.versionPre
    let pluginVersion = nodePreVersion < 16 ? 8 : null
    this.handleInstall(HUSKY, dev, pluginVersion)
    tool.execSync("npx " + HUSKY + " install")
  }
  pre(installs) {
    // console.log(installs,'installs')
    for (let item of installs) {
      const { plugin, config, dev, pkg } = item
      // 有需要合并的脚本
      pkg && this.handlePkg(pkg)
      // 有需要write的config文件
      config && this.handleConfig(config)
      if (plugin === "husky") this.checkHusky(dev)
      else this.handleInstall(plugin, dev)
    }
  }
}

export default Installer
