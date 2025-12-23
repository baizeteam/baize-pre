#!/usr/bin/env node

// 为与本仓库 ESM(package.json 中 type: module) 兼容，使用 createRequire
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const require = createRequire(import.meta.url)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 读取 package.json
const packageJsonPath = path.join(__dirname, '../package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

// 解析当前版本号
const currentVersion = packageJson.version
const versionParts = currentVersion.split('.').map(Number)

console.log(`当前版本: ${currentVersion}`)

// 版本号递增逻辑
if (versionParts[2] < 9) {
  versionParts[2] += 1
} else if (versionParts[1] < 9) {
  versionParts[1] += 1
  versionParts[2] = 0
} else {
  versionParts[0] += 1
  versionParts[1] = 0
  versionParts[2] = 0
}

const newVersion = versionParts.join('.')
console.log(`新版本: ${newVersion}`)

// 更新 package.json
packageJson.version = newVersion
fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJson, null, 2) + '\n',
  'utf-8'
)

console.log(`✅ 版本号已更新为: ${newVersion}`)


