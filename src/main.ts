import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { ComputerModule } from "./computer/computer.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ComputerModule,
    new FastifyAdapter(),
  );
  await app.listen(3000);
}
bootstrap();
