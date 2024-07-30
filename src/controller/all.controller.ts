import readlineSync from "readline-sync";
import { installerService } from "@/service/installer.service";
import { PluginService } from "@/service/plugin.service";
import { loggerService } from "@/service/logger.service";

export class AllController {
  static key = "all";
  constructor() {
    const answer = readlineSync.question(
      "Would you like to install prettier, husky, and typescript that work with your Node.js version? (y/n) "
    );
    if (answer.toLowerCase() !== "n") {
      installerService
        .install(new PluginService(false).get())
        .then(() => loggerService.finish(AllController.key));
    } else {
      loggerService.warn("Cancel the installation");
    }
  }
}
