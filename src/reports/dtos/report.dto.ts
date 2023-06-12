import { Expose, Transform } from "class-transformer";

import { Report } from "../reports.entity";

export class ReportDto {
  @Expose()
  id: number;

  @Expose()
  price: number;

  @Expose()
  year: number;

  @Expose()
  lng: number;

  @Expose()
  lat: number;

  @Expose()
  make: string;

  @Expose()
  model: string;

  @Transform(({ obj }: { obj: Report }) => obj.user.id)
  @Expose()
  userId: number;
}
