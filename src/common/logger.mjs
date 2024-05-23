import chalk from "chalk"

const logger = {
  success: function (s, isBold) {
    const handler = isBold ? chalk.bold.blue(s) : chalk.blue(s)
    return console.log(handler)
  },
  warn: function (s, isBold) {
    const handler = isBold ? chalk.bold.yellow(s) : chalk.yellow(s)
    return console.log(handler)
  },
  error: function (s, isBold) {
    const handler = isBold ? chalk.bold.red(s) : chalk.red(s)
    return console.log(handler)
  }
}

export default logger
