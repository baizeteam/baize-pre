import type { CommandInstance } from '@/types/command.interface'
import type { NodeInstance } from '@/types/node.interface'
import { InitController } from '@/controller/init.controller'
import { TemplateController } from '@/controller/template.controller'
import { commandService } from '@/service/command.service'
import { nodeService } from '@/service/node.service'

export class MainModule {
  public readonly nodeService: NodeInstance = nodeService
  public readonly commandService: CommandInstance = commandService
  getAll() {
    return [
      InitController,
      // RemoveController, // 暂时隐藏 remove 功能
      TemplateController,
    ]
  }
}
