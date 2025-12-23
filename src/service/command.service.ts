import type { CommandInstance } from '@/types/command.interface'
import type { PackageInstance } from '@/types/package.interface'
import { PackageService } from '@/service/package.service'

class CommandService implements CommandInstance {
  private readonly packageService: PackageInstance
  public readonly main: string
  public readonly subs
  constructor() {
    this.packageService = new PackageService(false)
    const pkgInfo = this.packageService.get()
    const binKeys = pkgInfo.bin ? Object.keys(pkgInfo.bin) : []
    this.main = `${binKeys[0] || 'baize'}`
    this.subs = {
      init: {
        alias: '',
        description:
          'Choose and install multiple plugins, and configure them according to your Node.js version. Use \'init --all\' to install all plugins.',
        examples: [`${this.main}init`, `${this.main}init --all`],
      },
      template: {
        alias: 't',
        description: 'Create a new project with a template.',
        examples: [`${this.main}template`],
      },
    }
  }
}

export const commandService = new CommandService()
