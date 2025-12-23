import type { PluginInstance } from '@/types/plugin.interface'
import type { TYPE_PLUGIN_ITEM } from '@/types/plugin.types'
import path from 'node:path'
import fsExtra from 'fs-extra'
import { ESLINT, HUSKY, PRETTIER, TS } from '@/const/plugin.const'
import { nodeService } from '@/service/node.service'

export class PluginService implements PluginInstance {
  // 从用户项目读取配置文件（用于检测用户是否已有配置）
  private readConfig(relativePath: string): string {
    const full = path.join(process.cwd(), relativePath)
    if (!fsExtra.existsSync(full))
      return ''
    return fsExtra.readFileSync(full, 'utf-8')
  }

  // 从项目根目录（baize-pre 项目本身）读取配置文件
  private readProjectConfig(relativePath: string): string {
    // 发布后会在 node_modules/baize-pre/dist 下
    const projectConfigPath = path.join(nodeService.root, 'dist', relativePath)
    if (!fsExtra.existsSync(projectConfigPath))
      return ''
    return fsExtra.readFileSync(projectConfigPath, 'utf-8')
  }

  private readConfigFirst(candidates: string[]): {
    filename: string | null
    content: string
  } {
    for (const name of candidates) {
      const content = this.readConfig(name)
      if (content)
        return { filename: name, content }
    }
    return { filename: null, content: '' }
  }

  // 检测配置文件是否存在
  private detectConfigFiles() {
    const prettierFiles = [
      '.prettierrc',
      '.prettierrc.json',
      '.prettierrc.js',
      '.prettierrc.cjs',
      '.prettierrc.mjs',
      'prettier.config.js',
      'prettier.config.cjs',
      'prettier.config.mjs',
      'prettier.config.json',
    ]

    const eslintFiles = [
      '.eslintrc',
      '.eslintrc.json',
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.mjs',
      'eslint.config.js',
      'eslint.config.cjs',
      'eslint.config.mjs',
      'eslint.js',
      'eslint.cjs',
    ]

    const tsFiles = ['tsconfig.json']

    // const huskyFiles = [".husky"];

    return {
      prettier: this.readConfigFirst(prettierFiles),
      eslint: this.readConfigFirst(eslintFiles),
      typescript: this.readConfigFirst(tsFiles),
      husky: fsExtra.existsSync(path.join(process.cwd(), '.husky')),
    }
  }

  // 提供内置插件定义，支持配置文件检测和修改
  private getBuiltinPlugins(): TYPE_PLUGIN_ITEM[] {
    const configs = this.detectConfigFiles()

    const plugins: TYPE_PLUGIN_ITEM[] = []

    // 从项目根目录读取配置文件
    const projectPrettierConfig = this.readProjectConfig('.prettierrc')
    const projectEslintConfig = this.readProjectConfig('eslint.config.js')
    const projectTsConfig = this.readProjectConfig('tsconfig.json')
    const projectLintStagedConfig = this.readProjectConfig('lint-staged.config.mjs')

    // Prettier 插件
    const prettierConfigContent = projectPrettierConfig || configs.prettier.content
    const prettierConfigFile
      = configs.prettier.filename && configs.prettier.content
        ? configs.prettier.filename
        : '.prettierrc'
    if (!prettierConfigContent) {
      throw new Error('Prettier config not found in project root')
    }
    plugins.push({
      name: PRETTIER,
      dev: true,
      config: {
        file: prettierConfigFile,
        json: prettierConfigContent,
      },
      pkgInject: {
        devDependencies: { prettier: '^3.3.3' },
        scripts: { format: 'prettier --write .' },
      },
    })

    // ESLint 插件
    // 如果用户已有并写入内容，则沿用其文件名；否则默认生成 flat 配置文件 eslint.config.js
    const eslintConfigContent = projectEslintConfig || configs.eslint.content
    const eslintConfigFile
      = configs.eslint.filename && configs.eslint.content
        ? configs.eslint.filename
        : 'eslint.config.js'
    if (!eslintConfigContent) {
      throw new Error('ESLint config not found in project root')
    }
    plugins.push({
      name: ESLINT,
      dev: true,
      config: {
        file: eslintConfigFile,
        json: eslintConfigContent,
      },
      pkgInject: {
        devDependencies: {
          'eslint': '^8.42.0',
          '@antfu/eslint-config': '^5.4.1',
          '@typescript-eslint/parser': '^6.0.0',
          '@typescript-eslint/eslint-plugin': '^6.0.0',
          'eslint-config-prettier': '^9.0.0',
          'eslint-plugin-prettier': '^5.0.0',
        },
        scripts: { lint: 'eslint . --ext .ts,.tsx,.js --fix' },
      },
    })

    // TypeScript 插件
    const tsConfigContent = projectTsConfig || configs.typescript.content
    if (!tsConfigContent) {
      throw new Error('TypeScript config not found in project root')
    }
    plugins.push({
      name: TS,
      dev: true,
      config: {
        file: configs.typescript.filename || 'tsconfig.json',
        json: tsConfigContent,
      },
      pkgInject: {
        devDependencies: { typescript: '^5.5.3' },
        scripts: { typecheck: 'tsc --noEmit' },
      },
    })

    // Husky 插件（需要检测 git）
    plugins.push({
      name: HUSKY,
      dev: true,
      config: [
        {
          file: '.husky/pre-commit',
          json: 'npx lint-staged\n',
        },
        {
          file: 'lint-staged.config.mjs',
          json: projectLintStagedConfig,
        },
      ] as any,
      pkgInject: {
        devDependencies: {
          'husky': '^9.1.1',
          'lint-staged': '^15.2.7',
        },
      },
    })

    return plugins
  }

  constructor(_unused: boolean) {}

  getAll() {
    return this.get().map(item => item.name)
  }

  get(): TYPE_PLUGIN_ITEM[] {
    return this.getBuiltinPlugins()
  }

  reset() {}
  set(_unused: string, _unused2: object) {}
}
