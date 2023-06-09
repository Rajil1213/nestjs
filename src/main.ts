import fastifyCsrf from "@fastify/csrf-protection";
import secureSession from "@fastify/secure-session";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: { level: "debug" } }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.register(secureSession, {
    secret: "averylogphrasebiggerthanthirtytwochars",
    salt: "mq9hDxBVDbspDR6n",
    logLevel: "debug",
  });
  await app.register(fastifyCsrf, { sessionPlugin: "@fastify/secure-session" });

  await app.listen(3000);
}
bootstrap();
