## 介绍

功能是标准化前端工程项目-prettier, husky, typescript，
支持渐进式无侵害接入旧项目;
也可以一键生成新项目，包括安装插件, 并生成插件对应的配置文件，
如tsconfig.json ,.husky/pre-commit, .prettierrc等。
还会检测.git目录不存在，自动init master并创建.gitignore文件,配置git config core.ignorecase false

## 前言

每次公司或者自己创建新项目，都要手动安装 prettier husky typescript等一系列插件 还要配置文件，
基本记不住的都要去copy上一个项目，带来了心智负担，
尤其husky每次还要创建pre-commit文件，并且添加echo命令，
于是打算封装规范化的脚手架，供创建项目，或者旧项目要加上这些配置和依赖的时候使用。

## 支持

本插件只基于node，所以无论是node框架项目，还是vue/react/angular/webpack/vite/rollup都适用，
也无需芥蒂window or mac电脑，且提供默认的配置，
傻瓜式安装。（理论上所有项目规范一般都是统一的，也支持自定义配置插件的配置文件）

## 视频教程
http://media.leaiv.cn/baize-pre/video.html

## 优势

- 侵入成本小，新项目一键搞定，无心智负担
- 渐进式命令init和install，无论新老项目皆可以
- 自定义配置，多种场景多种命令匹配
- 体积小，脚手架2M不到
- 不关心平台和前端框架，只要有node，几乎支持配置前端所有框架的项目规范

## 功能实现

- init: Choose and install multiple plugins, and configure them according to your Node.js version.
- install: Install and configure some plugins compatible with your Node.js version.
- uninstall: Uninstall some plugins and remove their configuration settings that are related to your Node.js version.
- all: Quickly install all plugins and configure them with your Node.js version.
- config: Configure the CLI variable. Once configured, use it everywhere.
- -h: View help.
- -V: View current version.

## 依赖插件

- commander: 参数解析
- inquirer: 选项交互式工具，有它就可以实现命令行的选项
- chalk: 粉笔帮我们在控制台画出各种各样的颜色
- readline-sync：询问式交互工具

## 期望

- 寻找更多有志之士，邮箱:1795691637@qq.com
- 喜欢点个star吧～

## TODO
- 搜寻意见，是需要做“一个项目选择一次包管理工具”，还是“该项目每次安装都需要询问包管理工具”。
- 使用TS重构(并配置alias路径)
