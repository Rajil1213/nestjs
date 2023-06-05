# Scratch

A sample project that scaffolds a simple NEST application with two routes:

- `/app/hello`, and
- `/app/bye`

## Notes

### Starting from Scratch

1. Install dependencies:

   - `@nestjs/common` ⇒ vas majority of functions, classes, etc. that we need from Nest
   - `@nestjs/core` ⇒
   - `@nestjs/platform-fastify` ⇒ lets Nest use Fastify for handling HTTP Requests as Nest itself does not handle routing
   - `relect-metadata` ⇒ library tied to decorators
   - `typescript` ⇒ use instead of javascript (recommended)

2. Setup TS compiler settings with `tsconfig.json`

   ```tsx
   {
     "compilerOptions": {
       "module": "CommonJS",
       "target": "ES2017",
       "experimentalDecorators": true,
       "emitDecoratorMetadata": true
     }
   }
   ```

   Note that `tsc` expects at least one typescript file in the directory. So, it might throw an error or complain if there is no typescript file in the current working directory.

The above steps are handled by the Nest CLI

## Components

- Nest uses “something” to handle the request-response cycle.
- Regardless of the library or framework, the process looks somewhat like this after a request is received:
  1. Validate data contained in the request
  2. Make sure the user is authenticated
  3. Route the request to a particular function
  4. Run some business logic
  5. Access a database
- Finally, a response is dispatched
- Nest has tools to help in the above process:
  - `Pipe` ⇒ to validate data
  - `Guard` ⇒ to make sure the user is authenticated
  - `Controller` ⇒ to route the request to a particular function
  - `Service` ⇒ to run the business logic
  - `Repository` ⇒ to access the database
- Other parts of `Nest`
  - `Modules` ⇒ groups together code
  - `Interceptors` ⇒ adds extra logic to incoming requests or outgoing responses
  - `Filters` ⇒ handles errors that occur during processing
- The most basic elements are `modules` and `controllers`

### The First Controller

- Create `src/main.ts`
- For starters, create `module` and `controller` in the same file

  ```tsx
  import { Controller, Get } from "@nestjs/common";

  // decorator to handle routing
  @Controller()
  class AppController {
    // create methods for routes and specify the method via another decorator
    @Get()
    getRootRoute() {
      return "Hi, there!";
    }
  }
  ```

### The First Module

- Use the `@Module()` decorator that expects a config object
- This is required for the startup
- Create a main startup function, traditionally called `bootstrap` that starts up the App
- To do this, use the `NestFactory.create(<module>)` method from `@nestjs/core`.
- Most methods are located in the `@nestjs/common` package and you will most likely never have to use an import from the `core` package.

  ```tsx
  // src/main.ts
  ...

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
  ```

- Go to [http://localhost:3000](http://localhost:3000)

### Naming Convention

- One class per file (some exceptions)
- Class names should include the kind of thing we are creating
- Name of the class and the name of the file should always match
- Example: `app.controller.ts` has `class AppController {}`
- Pattern: `<name>.<type_of_thing>.<ext>`
- So refactor out and export controllers and modules from the main file to their separate files.

## Routing Decorators

- We can add rules to the `Controller` and `Get` decorators
- For example, we can specify a specific route: `@Get("/asdf")`
- We can also add a route to the `Controller` decorator: `@Controller("/app")`
- We use the route on the `Controller` for high-level routing.
- Using the above examples together means that the route `app/asdf` becomes accessible while the others would return a 404 error.
