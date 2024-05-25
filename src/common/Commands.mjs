// 命令相关

class Commands {
  constructor() {
    this.main = "dog1 "
  }
  resolve() {
    return {
      init: {
        alias: "ini",
        description:
          "Choose multiple plugins to install and config with your node version.",
        examples: [this.main + "init"]
      },
      install: {
        alias: "i",
        description:
          "Choose single plugin to install and config with your node version.",
        examples: [this.main + "i <plugin-name>"]
      },
      all: {
        alias: "a",
        description:
          "Quickly install all plugins and config with your node version.",
        examples: [this.main + "all"]
      },
      config: {
        alias: "conf",
        description: "Configure the cli variable. Once config, use everywhere.",
        examples: [
          this.main + "config set <k> <v>",
          this.main + "config get <k>"
        ]
      },
      "*": {
        alias: "",
        description: "Command not found.",
        examples: []
      }
    }
  }
}

export default Commands
