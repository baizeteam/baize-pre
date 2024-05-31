// 命令相关

class Commands {
  constructor() {
    this.main = "baize "
  }
  resolve() {
    return {
      init: {
        alias: "",
        description:
          "Choose multiple plugins to install and config with your node version.",
        examples: [this.main + "init"]
      },
      install: {
        alias: "i",
        description:
          "Install add config some plugins with your node version.",
        examples: [this.main + "i <plugin-name>"]
      },
      uninstall: {
        alias:"",
        description: "Uninstall some plugins add remove the config with your node version.",
      },
      all: {
        alias: "a",
        description:
          "Quickly install all plugins and config them with your node version.",
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
