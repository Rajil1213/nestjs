import { DiskService } from "./../disk/disk.service";
import { Controller, Get } from "@nestjs/common";
import { CpuService } from "src/cpu/cpu.service";

@Controller("computer")
export class ComputerController {
  constructor(
    private cpuService: CpuService,
    private diskService: DiskService,
  ) {}

  @Get()
  run() {
    const result = this.cpuService.compute(1, 5);
    const diskWriteResult = this.diskService.writeToDisk(`${result}`);

    return [result, diskWriteResult];
  }
}
