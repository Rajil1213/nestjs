import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "./app.module";

// create a function to initialize the application
// use NestFactory from `@nestjs/core` (most import DON'T come from here)
async function bootstrap() {
  // create an instance of our Nest Application, uses platform-express by default
  // const app = await NestFactory.create(AppModule);

  // use the following invocation to use fastify
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.listen(3000);
}

bootstrap();
