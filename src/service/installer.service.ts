import type { InstallerInstance } from '@/types/installer.interface'
import type { LoggerInstance } from '@/types/logger.interface'
import type { TYPE_MANAGER_NAME } from '@/types/manager.types'
import type { NodeInstance } from '@/types/node.interface'
import type { PackageInstance } from '@/types/package.interface'
import type { TYPE_PLUGIN_ITEM } from '@/types/plugin.types'
import type { ToolInstance } from '@/types/tool.interface'
import { join } from 'node:path'
import fsExtra from 'fs-extra'
import inquirer from 'inquirer'
import { MANAGER_LIST, PNPM } from '@/const/manager.const'
import { ESLINT, TS } from '@/const/plugin.const'
import { loggerService } from '@/service/logger.service'
import { nodeService } from '@/service/node.service'
import { PackageService } from '@/service/package.service'
import { PluginService } from '@/service/plugin.service'
import { toolService } from '@/service/tool.service'

class InstallerService implements InstallerInstance {
  private userPkg: PackageInstance
  private managerName!: TYPE_MANAGER_NAME
  private pluginService!: PluginService
  private readonly loggerService: LoggerInstance = loggerService
  private readonly toolService: ToolInstance = toolService
  private readonly nodeService: NodeInstance = nodeService
  // 如果用户已有 lint-staged 配置文件，则沿用其文件名；否则默认生成 lint-staged.config.mjs
  #resolveLintStagedFile(): string {
    const candidates = [
      'lint-staged.config.mjs',
      'lint-staged.config.js',
      'lint-staged.config.cjs',
      '.lintstagedrc',
      '.lintstagedrc.json',
      '.lintstagedrc.js',
      '.lintstagedrc.cjs',
    ]
    for (const name of candidates) {
      if (fsExtra.existsSync(join(this.userPkg.curDir, name))) return name
    }
    return 'lint-staged.config.mjs'
  }

  constructor() {
    this.userPkg = new PackageService(true)
  }

  async chooseManager(): Promise<void> {
    const questionKey = 'manager'
    const question = [
      {
        type: 'list',
        name: questionKey,
        message: 'Which package manager to use?',
        choices: MANAGER_LIST,
      },
    ]
    const answer = await inquirer.prompt(question)
    const result = answer[questionKey]
    this.loggerService.success(`You have chosen: ${result}`)
    const { preVersion, fullVersion } = this.nodeService.versions
    if (preVersion < 16 && result === PNPM) {
      this.loggerService.error(
        `Sorry, your Node.js version is not supported by "${PNPM}".`
      )
      this.loggerService.error(`Expected >= 16, but got "${fullVersion}".`)
    } else {
      this.managerName = result
    }
  }

  async #handleInstall(
    pluginName: string,
    dev: boolean = false,
    version: number | null = null
  ) {
    /** 必须在install前刷新一遍pkg的info,避免npm 安装时写入和我们的写入顺序冲掉了 */
    this.userPkg.get()
    const { managerName } = this
    let exec =
      managerName === 'yarn' ? `${managerName} add ` : `${managerName} install `
    // 如果是本地模块，则加上-D
    dev && (exec += ' -D ')
    exec += pluginName
    // 如果指定插件版本，则带上version
    version && (exec += `@${version}`)

    try {
      // 捕获安装错误
      this.loggerService.warn(`Installing ${pluginName} ... `)
      this.toolService.execSync(exec)
      this.loggerService.success(`Installed ${pluginName} successfully. `)
    } catch (e) {
      this.loggerService.error(`Error: install ${pluginName} : `)
      console.log(e) // 承接上一行错误，但不要颜色打印
    }
  }

  #handleConfig(
    config: { file: string, json: any } | Array<{ file: string, json: any }>
  ) {
    this.userPkg.get()
    const writeOne = (conf: { file: string, json: any }) => {
      const filepath = join(this.userPkg.curDir, conf.file)
      try {
        const { json } = conf
        if (typeof json === 'object')
          this.toolService.writeJSONFileSync(filepath, json)
        else fsExtra.writeFileSync(filepath, json)
      } catch (_unused) {
        return this.loggerService.error(
          'Internal Error: Configuration injection failed in handleConfig.'
        )
      }
    }
    Array.isArray(config) ? config.forEach(writeOne) : writeOne(config)
  }

  #updatePackage(pkgInject: Record<string, any>) {
    this.userPkg.get()
    const pkg = this.userPkg.get()

    for (const key in pkgInject) {
      if (key === 'scripts') {
        // 对于 scripts，不覆盖现有命令
        const existingScripts = pkg.scripts || {}
        const newScripts = pkgInject[key]

        // 只添加不存在的脚本
        for (const scriptKey in newScripts) {
          if (!existingScripts[scriptKey]) {
            existingScripts[scriptKey] = newScripts[scriptKey]
          }
        }

        this.userPkg.update(key, existingScripts)
      } else {
        // 其他配置直接更新
        this.userPkg.update(key, pkgInject[key])
      }
    }
  }

  // #mergeArrayUnique(target: string[] = [], more: string[] = []): string[] {
  //   const set = new Set([...(target || []), ...(more || [])]);
  //   return Array.from(set);
  // }

  async #finalizeLintStaged() {
    // 根据已安装插件，配置 lint-staged，可以覆盖现有命令
    const pkg = this.userPkg.get()
    const hasPrettier = Boolean(
      pkg.devDependencies?.prettier || pkg.dependencies?.prettier
    )
    const hasESLint = Boolean(
      pkg.devDependencies?.eslint || pkg.dependencies?.eslint
    )
    const hasTypeScript = Boolean(
      pkg.devDependencies?.typescript || pkg.dependencies?.typescript
    )
    const hasHusky = Boolean(
      pkg.devDependencies?.husky || pkg.dependencies?.husky
    )

    // 如果安装了 husky，配置 lint-staged（可以覆盖现有配置）
    if (hasHusky) {
      const lsKey = 'lint-staged'
      const codeFiles = '*.{js,ts,vue,jsx,tsx}'
      const textFiles = '*.{json,md,yml,yaml}'

      const lintStagedConfig: Record<string, string[]> = {}

      if (hasPrettier) {
        lintStagedConfig[codeFiles] = ['npx prettier --write']
        lintStagedConfig[textFiles] = ['npx prettier --write']
      }

      if (hasESLint) {
        if (lintStagedConfig[codeFiles]) {
          // Prettier 先执行，ESLint 后执行，避免格式化冲突
          lintStagedConfig[codeFiles].push('npx eslint --fix')
        } else {
          lintStagedConfig[codeFiles] = ['npx eslint --fix']
        }
      }

      // TypeScript 类型检查只对 TypeScript 文件运行，避免检查 JavaScript 文件
      // 使用 --skipLibCheck 跳过 node_modules 的类型检查，避免第三方库的类型错误
      // 注意：只检查 .ts 和 .tsx 文件，不检查 .vue 文件（.vue 文件需要 vue-tsc）
      if (hasTypeScript) {
        // 只检查纯 TypeScript 文件，不包含 .vue
        const pureTsFiles = '*.{ts,tsx}'
        lintStagedConfig[pureTsFiles] = ['tsc --noEmit --skipLibCheck']
      }

      // 直接覆盖 lint-staged 配置
      this.userPkg.update(lsKey, lintStagedConfig)

      // 同时更新 lint-staged.config.mjs 文件
      const lintStagedConfigFile = this.#resolveLintStagedFile()
      const lintStagedConfigMjsPath = join(
        this.userPkg.curDir,
        lintStagedConfigFile
      )
      const configContent = `export default {\n${Object.entries(
        lintStagedConfig
      )
        .map(([pattern, commands]) => {
          const commandsStr = commands.map(cmd => `'${cmd}'`).join(', ')
          return `  '${pattern}': [${commandsStr}],`
        })
        .join('\n')}\n}`
      fsExtra.writeFileSync(lintStagedConfigMjsPath, configContent, 'utf-8')
    } else {
      // 如果没有安装 husky，在 scripts 中添加对应的脚本命令（不覆盖现有命令）
      const scripts = pkg.scripts || {}

      if (hasPrettier && !scripts.format) {
        scripts.format = 'prettier --write .'
      }
      if (hasESLint && !scripts.lint) {
        scripts.lint = 'eslint . --ext .ts,.tsx,.js --fix'
      }
      if (hasTypeScript && !scripts.typecheck) {
        scripts.typecheck = 'tsc --noEmit --skipLibCheck'
      }

      // 更新 scripts
      if (Object.keys(scripts).length > 0) {
        this.userPkg.update('scripts', scripts)
      }
    }
  }

  #createGitignore() {
    this.userPkg.get()
    const gitignorePath = join(this.userPkg.curDir, '.gitignore')

    // 如果 .gitignore 文件已存在，则不覆盖
    if (fsExtra.existsSync(gitignorePath)) {
      this.loggerService.warn('.gitignore already exists, skipping creation.')
      return
    }

    // 从项目根目录的 dist 目录读取 .gitignore 文件（发布后会在包根目录的 dist 下）
    const projectGitignorePath = join(
      this.nodeService.root,
      'dist',
      '.gitignore'
    )

    if (!fsExtra.existsSync(projectGitignorePath)) {
      this.loggerService.warn(
        '.gitignore not found in project root, skipping creation.'
      )
      return
    }

    let gitignoreContent: string
    try {
      gitignoreContent = fsExtra.readFileSync(projectGitignorePath, 'utf-8')
    } catch (error) {
      this.loggerService.error('Failed to read .gitignore from project root:')
      console.log(error)
      return
    }

    try {
      fsExtra.writeFileSync(gitignorePath, gitignoreContent)
      this.loggerService.success('.gitignore file created successfully.')
    } catch (error) {
      this.loggerService.error('Failed to create .gitignore file:')
      console.log(error)
    }
  }

  #checkGit() {
    this.userPkg.get()
    const gitPath = join(this.userPkg.curDir, '.git')
    if (!fsExtra.existsSync(gitPath)) {
      // 询问用户是否创建 git
      const question = [
        {
          type: 'confirm',
          name: 'createGit',
          message: 'No git repository found. Do you want to create one?',
          default: true,
        },
      ]

      return inquirer.prompt(question).then((answer: any) => {
        if (answer.createGit) {
          this.toolService.execSync('git init -b master')
          // 忽略文件大小写
          this.toolService.execSync('git config core.ignorecase false')

          // 创建通用的 .gitignore 文件
          this.#createGitignore()

          this.loggerService.success('Git repository initialized successfully.')
          return true
        } else {
          this.loggerService.warn(
            'Git repository creation cancelled. Husky requires git to work properly.'
          )
          return false
        }
      })
    }
    return Promise.resolve(true)
  }

  async #checkESLint() {
    // 检查 package.json 是否有 "type": "module"
    const pkg = this.userPkg.get()
    if (pkg.type === 'module') {
      return // 已经有 type: module，不需要处理
    }

    // 如果没有 type: module，询问用户是否需要添加
    const question = [
      {
        type: 'confirm',
        name: 'addModuleType',
        message:
          'ESLint config requires "type": "module" in package.json. Do you want to add it automatically?',
        default: true,
      },
    ]

    const answer = await inquirer.prompt(question)
    if (answer.addModuleType) {
      // 直接更新 package.json 的 type 字段
      const pkg = this.userPkg.get()
      pkg.type = 'module'
      this.toolService.writeJSONFileSync(this.userPkg.curPath, pkg)
      this.loggerService.success('Added "type": "module" to package.json')
    } else {
      this.loggerService.warn(
        'Skipping "type": "module" addition. ESLint may not work correctly without it.'
      )
    }
  }

  async #checkHusky() {
    // 检查 git，如果没有则询问是否创建
    const gitReady = await this.#checkGit()
    if (!gitReady) {
      this.loggerService.warn(
        'Skipping husky installation: git repository required'
      )
      return // 跳过 husky 安装，不抛出错误
    }

    // 检查并创建 .gitignore（如果不存在）
    this.#createGitignore()

    // 如果 node 版本小于 16，使用 @8 版本插件
    const huskyVersion = this.nodeService.versions.preVersion < 16 ? 8 : null

    // 安装 husky
    await this.#handleInstall('husky', true, huskyVersion)

    // 初始化 husky
    this.toolService.execSync('npx husky install')

    // 安装 lint-staged
    await this.#handleInstall('lint-staged', true)
  }

  async #chooseTypeScriptFramework(): Promise<string> {
    const question = [
      {
        type: 'list',
        name: 'framework',
        message: 'Which TypeScript framework do you want to use?',
        choices: [
          { name: 'Vue + TypeScript', value: 'vue' },
          { name: 'React + TypeScript', value: 'react' },
          { name: 'Node.js + TypeScript', value: 'node' },
        ],
      },
    ]

    const answer = await inquirer.prompt(question)
    return answer.framework
  }

  async #handleTypeScriptConfig(framework: string) {
    // 框架 -> 模板文件映射
    const frameworkMap: Record<string, string> = {
      vue: 'tsconfig.vue.json',
      react: 'tsconfig.react.json',
      node: 'tsconfig.json', // 原 node-ts 模板
    }
    const templateFileName = frameworkMap[framework] || 'tsconfig.json'

    // 先尝试从 dist 目录读取（发布后的路径），再回退到项目根目录（开发环境）
    let templatePath = join(this.nodeService.root, 'dist', templateFileName)
    if (!fsExtra.existsSync(templatePath))
      templatePath = join(this.nodeService.root, templateFileName)

    if (!fsExtra.existsSync(templatePath)) {
      this.loggerService.error(
        `TypeScript template file not found: ${templateFileName}`
      )
      return
    }

    // 读取模板内容
    const templateContent = fsExtra.readFileSync(templatePath, 'utf-8')

    // 写入到用户项目的 tsconfig.json
    const userTsConfigPath = join(this.userPkg.curDir, 'tsconfig.json')
    fsExtra.writeFileSync(userTsConfigPath, templateContent, 'utf-8')
    this.loggerService.success(
      `Created tsconfig.json for ${framework} successfully.`
    )
  }

  async install(plugins: TYPE_PLUGIN_ITEM[]) {
    await this.chooseManager()
    for (const pluginItem of plugins) {
      const { name, config, dev, pkgInject } = pluginItem
      const pluginName = name

      // 在安装 ESLint 之前检查并提示设置 type: module
      if (pluginName === ESLINT) {
        await this.#checkESLint()
      }

      await this.#handleInstall(
        pluginName,
        dev,
        pluginName === 'husky' && this.nodeService.versions.preVersion < 16
          ? 8
          : null
      )
      // 顺序很重要，放最前面
      pluginName === 'husky' && (await this.#checkHusky())

      // TypeScript 特殊处理：询问框架类型并写入对应的配置文件
      if (pluginName === TS) {
        const framework = await this.#chooseTypeScriptFramework()
        await this.#handleTypeScriptConfig(framework)
      }

      // // 有需要合并的脚本
      pkgInject && (await this.#updatePackage(pkgInject))
      // // 有需要write的config文件（TypeScript 已单独处理，跳过）
      if (pluginName !== TS && config) {
        this.#handleConfig(config)
      }
    }
    await this.#finalizeLintStaged()
  }

  async choose() {
    this.pluginService = new PluginService(false)
    const storagePlugins = this.pluginService.getAll()

    // 使用更可靠的交互方式，避免 checkbox 键盘快捷键问题
    const selectedPlugins: string[] = []
    let continueSelecting = true

    console.log('Available plugins:')
    storagePlugins.forEach((plugin, index) => {
      console.log(`${index + 1}. ${plugin}`)
    })

    while (
      continueSelecting &&
      selectedPlugins.length < storagePlugins.length
    ) {
      const availablePlugins = storagePlugins.filter(
        plugin => !selectedPlugins.includes(plugin)
      )

      if (availablePlugins.length === 0) break

      const question = [
        {
          type: 'list',
          name: 'plugin',
          message:
            selectedPlugins.length > 0
              ? `Selected: ${selectedPlugins.join(', ')}\nChoose another plugin (or 'Done' to finish):`
              : 'Choose a plugin to install:',
          choices: [...availablePlugins, new inquirer.Separator(), 'Done'],
        },
      ]

      const answer = await inquirer.prompt(question)

      if (answer.plugin === 'Done') {
        continueSelecting = false
      } else {
        selectedPlugins.push(answer.plugin)
      }
    }

    if (selectedPlugins.length === 0) {
      this.loggerService.warn('No plugins selected. Installation cancelled.')
      return
    }

    this.pluginService = new PluginService(false)
    const matInstalls = this.pluginService
      .get()
      .filter(item => selectedPlugins.includes(item.name))
    await this.install(matInstalls)
  }

  async installAll() {
    this.pluginService = new PluginService(false)
    const allPlugins = this.pluginService.get()
    await this.install(allPlugins)
  }
}

export const installerService = new InstallerService()
