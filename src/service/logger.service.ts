import chalk from "chalk";
import { commandService } from "@/service/command.service";
import { LoggerInstance } from "@/instance/logger.instance";
import { CommandInstance } from "@/instance/command.instance";

class LoggerService implements LoggerInstance {
  private readonly commandService: CommandInstance = commandService;
  private colorize(type: string, s: string, bold: boolean): string {
    let color = "yellow";
    if (type === "success") color = "green";
    else if (type === "error") color = "red";
    return bold ? chalk.bold[color](s) : chalk[color](s);
  }

  success(s: string, bold: boolean = false): void {
    console.log(this.colorize("success", s, bold));
  }

  warn(s: string, bold: boolean = false): void {
    console.log(this.colorize("warn", s, bold));
  }

  error(s: string, bold: boolean = false): void {
    console.log(this.colorize("error", s, bold));
  }

  finish(s: string): void {
    this.success(`${this.commandService.main} ${s} done.`, true);
  }
}

export const loggerService = new LoggerService();
