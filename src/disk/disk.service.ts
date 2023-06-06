import { Injectable } from "@nestjs/common";
import { PowerService } from "src/power/power.service";

@Injectable()
export class DiskService {
  constructor(private powerService: PowerService) {}

  writeToDisk(content: string) {
    console.log(
      "Drawing 15 watts of power from Power Service to write to disk",
    );
    this.powerService.supplyPower(15);
    return content;
  }
}
