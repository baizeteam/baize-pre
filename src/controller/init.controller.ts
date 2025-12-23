import { installerService } from '@/service/installer.service'
import { loggerService } from '@/service/logger.service'

export class InitController {
  static key = 'init'
  constructor(args: string[] = []) {
    // 检查是否有 --all 参数
    if (args.includes('--all')) {
      installerService.installAll().then(() => {
        loggerService.finish(InitController.key)
      })
    }
    else {
      installerService.choose().then(() => {
        loggerService.finish(InitController.key)
      })
    }
  }
}
