import { installerService } from "@/service/installer.service";
import { loggerService } from "@/service/logger.service";

export class InitController {
  static key = "init";
  constructor() {
    installerService.choose().then(() => {
      loggerService.finish(InitController.key);
    });
  }
}
