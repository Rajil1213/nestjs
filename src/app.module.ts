import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";

// pass a config to the Module decorator
// specify all controllers in the application
@Module({
  controllers: [AppController]
})
export class AppModule {
  // executed upon startup and takes the controllers and initializes them
}
