import { NodeInstance } from "@/instance/node.instance";
import { nodeService } from "@/service/node.service";
import { CommandInstance } from "@/instance/command.instance";
import { commandService } from "@/service/command.service";
import { InitController } from "@/controller/init.controller";
import { InstallController } from "@/controller/install.controller";
import { UninstallController } from "@/controller/uninstall.controller";
import { AllController } from "@/controller/all.controller";
import { ConfigController } from "@/controller/config.controller";

export class MainModule {
  public readonly nodeService: NodeInstance = nodeService;
  public readonly commandService: CommandInstance = commandService;
  getAll() {
    return [
      InstallController,
      InitController,
      AllController,
      UninstallController,
      ConfigController
    ];
  }
}
