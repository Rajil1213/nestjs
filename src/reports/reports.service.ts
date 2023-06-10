import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { CreateReportDto } from "./dtos/create-report.dto";
import { Report } from "./reports.entity";

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(report: CreateReportDto) {
    const newReport = this.repo.create(report);
    return this.repo.save(newReport);
  }
}
