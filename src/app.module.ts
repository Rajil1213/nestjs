import { Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";

import * as dbConfig from "../ormconfig.js";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CurrentUserGuard } from "./guards/current-user.guard";
import { ReportsModule } from "./reports/reports.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // use everywhere
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRoot(dbConfig),
    ReportsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
    {
      provide: APP_GUARD,
      useClass: CurrentUserGuard,
    },
  ],
})
export class AppModule {}
