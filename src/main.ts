import { Controller, Get, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";

// decorator to handle routing
@Controller()
class AppController {
  // create methods for routes and specify the method via another decorator
  @Get()
  getRootRoute() {
    return "Hi, there!";
  }
}

// pass a config to the Module decorator
// specify all controllers in the application
@Module({
  controllers: [AppController]
})
class AppModule {
  // executed upon startup and takes the controllers and initializes them
}

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
