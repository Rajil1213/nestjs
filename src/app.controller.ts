import { Controller, Get } from "@nestjs/common";

// decorator to handle routing
@Controller("app")
export class AppController {
  // create methods for routes and specify the method via another decorator
  @Get("/hello")
  getRootRoute() {
    return "Hi, there!";
  }

  @Get("/bye")
  getByeRoute() {
    return "Bye, bye";
  }
}
