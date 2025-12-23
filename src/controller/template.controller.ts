import type { SimpleGit } from 'simple-git'
import fs from 'node:fs'
import path from 'node:path'
import inquirer from 'inquirer'
import simpleGit from 'simple-git'

export class TemplateController {
  static key = 'template'
  private octokit: any
  private git: SimpleGit
  private owner: string = 'baizeteam'
  private repo: string = 'baize-template'
  constructor() {
    this.git = simpleGit()
    this.run()
  }

  async run() {
    // 动态导入 @octokit/rest
    const { Octokit } = await import('@octokit/rest')
    this.octokit = new Octokit({})

    const branches = await this.getBranches()
    if (branches) {
      const branch = await this.selectBranch(branches)
      const projectName = await this.projectName()
      await this.cloneAndRename(branch, projectName)
      await this.deleteGit(projectName)
      console.log('项目创建成功!')
    }
  }

  // 选择分支
  async selectBranch(branches: string[]) {
    const branchAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'branch',
        message: '请选择一个分支：',
        choices: branches,
      },
    ])
    return branchAnswer.branch
  }

  // 项目命名
  async projectName() {
    const projectNameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: '请输入项目名称：',
        validate: (input: string) =>
          input.trim() ? true : '项目名称不能为空！',
      },
    ])
    return projectNameAnswer.projectName
  }

  // 获取分支
  async getBranches() {
    try {
      const response = await this.octokit.repos.listBranches({
        owner: this.owner,
        repo: this.repo,
      })
      return response.data
        .map((branch: any) => branch.name)
        .filter((item: string) => item !== 'master')
    }
    catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  // 拉取代码并重命名项目
  async cloneAndRename(branch: string, projectName: string) {
    try {
      // 克隆代码库
      const cloneDir = path.join(process.cwd(), projectName)
      console.log(`正在克隆 ${branch} 分支到 ${cloneDir}...`)
      await this.git.clone(
        `https://github.com/${this.owner}/${this.repo}.git`,
        cloneDir,
        ['--branch', branch, '--single-branch'],
      )
      console.log(`代码克隆成功！`)

      // 重命名项目
      const projectDir = path.join(cloneDir, 'package.json')
      if (fs.existsSync(projectDir)) {
        const packageJson = JSON.parse(fs.readFileSync(projectDir, 'utf8'))
        packageJson.name = projectName // 修改项目名称
        fs.writeFileSync(projectDir, JSON.stringify(packageJson, null, 2))
        console.log(`项目名称已更新为 ${projectName}`)
      }

      // 可以在这里添加其他初始化步骤，比如安装依赖等
      // await this.git.cwd(cloneDir).raw(["npm", "install"]);
    }
    catch (error) {
      console.error('Error cloning or renaming project:', error)
    }
  }

  // 删除 git
  async deleteGit(projectName: string) {
    const projectDir = path.join(process.cwd(), projectName, '.git')
    if (fs.existsSync(projectDir)) {
      await fs.rmSync(projectDir, { recursive: true })
    }
  }
}
