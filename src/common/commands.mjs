export const PRETTIER = "prettier"
export const HUSKY = "husky"
export const LINT = "lint-staged"
export const TS = "typescript"
// 命令相关
export const mainCommand = "dog "
const commands = {
  init: {
    alias: "ini",
    description:
      "Choose multiple plugins to install and config with your node version.",
    examples: [mainCommand + "init", mainCommand + "ini"]
  },
  install: {
    alias: "i",
    description:
      "Choose single plugin to install and config with your node version.",
    examples: [
      mainCommand + "i " + PRETTIER,
      mainCommand + "i " + HUSKY,
      mainCommand + "i " + TS
    ]
  },
  all: {
    alias: "a",
    description:
      "Quickly install all plugins and config with your node version.",
    examples: [mainCommand + "all", mainCommand + "a"]
  },
  config: {
    alias: "conf",
    description: "Configure the cli variable. Once config, use everywhere.",
    examples: [
      mainCommand + "config set <k> <v>",
      mainCommand + "config get <k>"
    ]
  },
  "*": {
    alias: "",
    description: "Command not found.",
    examples: []
  }
}

export default commands
