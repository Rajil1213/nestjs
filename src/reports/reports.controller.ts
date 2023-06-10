import { AuthGuard } from "src/guards/auth.guard";

import { Body, Controller, Post, UseGuards } from "@nestjs/common";

import { CreateReportDto } from "./dtos/create-report.dto";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @UseGuards(AuthGuard)
  @Post()
  createReport(@Body() body: CreateReportDto) {
    this.reportsService.create(body);
  }
}
