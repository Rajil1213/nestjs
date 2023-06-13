import { User } from "src/users/users.entity";
import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { GetEstimateDto } from "./dtos/create-estimate.dto";
import { CreateReportDto } from "./dtos/create-report.dto";
import { Report } from "./reports.entity";

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(report: CreateReportDto, user: User) {
    const newReport = this.repo.create(report);
    newReport.user = user;
    return this.repo.save(newReport);
  }

  async approve(id: string, approve: boolean) {
    const report = await this.repo.findOne({ where: { id } });
    report.approved = approve;
    return this.repo.save(report);
  }

  async createEstimate({
    make,
    model,
    lng,
    lat,
    year,
    mileage,
  }: GetEstimateDto) {
    return await this.repo
      .createQueryBuilder("estimate")
      .select("ROUND(AVG(price), 2)", "price")
      .where("make = :make", { make }) // do not use raw string because SQLi
      .andWhere("model = :model", { model })
      .andWhere("lng - :lng BETWEEN -5 AND 5", { lng })
      .andWhere("lat - :lat BETWEEN -5 AND 5", { lat })
      .andWhere("year - :year BETWEEN -3 and 3", { year })
      .andWhere("approved IS TRUE")
      .orderBy("ABS(mileage - :mileage)", "DESC")
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
