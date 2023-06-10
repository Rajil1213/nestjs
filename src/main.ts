import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { AppModule } from "./app.module";
import { setupMiddleware } from "./setup-plugins";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: { level: "debug" } }),
  );

  await setupMiddleware(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("APP_PORT");
  await app.listen(port);
}
bootstrap();
