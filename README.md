## 介绍

功能是标准化前端工程项目-prettier, husky, typescript，
支持渐进式无侵害接入旧项目;
也可以一键生成新项目，包括安装插件, 并生成插件对应的配置文件，
如tsconfig.json ,.husky/pre-commit, .prettierrc等。
还会检测.git目录不存在，自动init dev并创建.gitignore文件,配置git config core.ignorecase false

## 前言

每次公司或者自己创建新项目，都要手动安装 prettier husky typescript等一系列插件 还要配置文件，
基本记不住的都要去copy上一个项目，带来了心智负担，
尤其husky每次还要创建pre-commit文件，并且添加echo命令，
于是打算封装规范化的脚手架，供创建项目，或者旧项目要加上这些配置和依赖的时候使用。

## 支持

本插件只基于node，所以无论是node框架项目，还是vue/react/angular/webpack/vite/rollup都适用，
也无需芥蒂window or mac电脑，且提供默认的配置，
傻瓜式安装。（理论上所有项目规范一般都是统一的，如需更改，后续也支持自定义）

## 优势

侵入成本小，新项目一键搞定，无心智负担。自定义配置，多种场景多种命令匹配。体积小，50k不到。（vue 脚手架2.2M)

## 功能实现

- init: Choose multiple plugins to install add config with your node version.
- install: Choose single plugin to install and config with your node version.
- all: Quickly install all plugins and config with your node version.
- config: Configure the cli variable. Once config, use everywhere.

## 依赖插件

- commander: 参数解析
- inquirer: 选项交互式工具，有他就可以实现命令行的选项
- chalk: 粉笔帮我们在控制台画出各种各样的颜色
- readline-sync：询问式交互工具

## 期望

- 寻找更多有志之士，邮箱:1795691637@qq.com
- 喜欢点个star吧～
