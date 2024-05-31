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
          "Choose and install multiple plugins, and configure them according to your Node.js version.",
        examples: [this.main + "init"]
      },
      install: {
        alias: "i",
        description:
          "Install and configure some plugins compatible with your Node.js version.",
        examples: [this.main + "i <plugin-name>"]
      },
      uninstall: {
        alias:"",
        description: "Uninstall some plugins and remove their configuration settings that are related to your Node.js version.",
      },
      all: {
        alias: "a",
        description:
          "Quickly install all plugins and configure them with your Node.js version.",
        examples: [this.main + "all"]
      },
      config: {
        alias: "conf",
        description: "Configure the CLI variable. Once configured, use it everywhere.",
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
