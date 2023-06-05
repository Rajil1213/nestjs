import { Controller, Get } from "@nestjs/common";

// decorator to handle routing
@Controller()
export class AppController {
  // create methods for routes and specify the method via another decorator
  @Get()
  getRootRoute() {
    return "Hi, there!";
  }
}
