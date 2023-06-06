import { PowerService } from "./../power/power.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CpuService {
  constructor(private PowerService: PowerService) {}

  compute(a: number, b: number) {
    console.log("Drawing 10 watts of power from Power Service for computation");
    this.PowerService.supplyPower(10);
    return a + b;
  }
}
