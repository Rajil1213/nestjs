# Messages

Store and retrieve messages stored in a JSON file

# Notes
## Setup

- Install the NEST CLI globally
    
    ```bash
    pnpm add -g @nest/cli
    ```
    
- Create the new NEST project
    
    ```bash
    nest new <project_name>
    ```
    

## What does `new` do?

When no flags are passed, the `new` command does the following:

- Initializes the specified project with the preferred package manager: `npm`, `yarn` or `pnpm`.
- Add a `README` with the default information about NestJS and running the project.
- Adds a `prettier` and `eslint` config (Grider is against ESLint but we’ll keep it 😉)
- Adds testing capabilities with `jest`
- Creates a `tsconfig.json` and `tsconfig.build.json` for the TypeScript compiler
- Creates scripts to run, lint, test, debug and build the application
- Adds `platform-express`. `platform-fastify` needs to be installed separately:

```bash
pnpm remove @nestjs/platform-express @types/express && pnpm add @nestjs/platform-fastify && pnpm update
```

Then, use the `FastifyAdapter`

```tsx
// src/main.ts

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.listen(3000);
}
bootstrap();
```

## The App

- Goal:
    - Store and Retrieve messages stored in a JSON File
- Routes:
    - List all messages
    - List a particular message
    - Create a message
- To list all message:
    - Route: `GET /messages`
    - Components
        - `controller` ⇒ for the route
        - `service` ⇒ for business logic
        - `repository` ⇒ for the JSON file
- To list a message:
    - Route: `GET /messages`
    - Components
        - `controller` ⇒ for the route
        - `service` ⇒ for business logic
        - `repository` ⇒ for the JSON file
- To create a message:
    - Route: `POST /messages`
    - Components
        - `pipe` ⇒ to validate the data contained in the request
        - `controller` ⇒ to route the request
        - `service` ⇒ to create the message
        - `respository` ⇒ to store the message
- So, all in all, we need:
    - 1 `controller` ⇒ `MessagesController`
    - 1 `service` ⇒ `MessagesService`
    - 1 `repository` ⇒ `MessagesRepository`
    - 1 `module` ⇒ `MessagesModule`

## Generating Files

#### Module

- First delete all the `app.*.ts` files
- Then, create a new module called `MessagesModule`:
    
    ```bash
    nest generate module Messages
    ```
    
- This will create a directory called `src/messages` and a file called `messages.module.ts` which has a class called `MessagesModule`

#### Controller

- Generate the controller
    
    ```bash
    nest generate messages/messages --flat
    ```
    
- This creates a `messages` controller/class in the `messages` directory that is hooked up with the `messages` module.
- It also creates the test file `messages.controller.spec.ts`.
- The `--flat` flag tells `nest` to not create a new `controllers` directory
- The `@Controller` decorator will contain `messages`

## Install a REST Client

- Either use the Postman or REST Client Extension on VS Code

## Access Request Params

- An HTTP Request is made up of:
    - Starting Line:
        - `POST`, `GET` or other methods
        - the route
            - contains a param such as `:id`
            - a query such as `?validate=true`
        - The HTTP version such as `1.1`
    - Headers
    - Body
- So far, we’ve seen:
    - `@Controller()` ⇒ class decorator
    - `@Get`, `@Post` ⇒ method decorators
- To access the request params, we are going to use `Params` decorators
- To access the POST request body, we will use the `@Body` decorator and to access the URL params, we use the `@Param()` decorator
    
    ```tsx
    	@Post()
      createMessage(@Body() body: any) {
        console.log(body);
      }
    
      @Get('/:id')
      getMessage(@Param('id') id: string) {
        console.log(id);
    	}
    ```
    

## Validating the `POST` body

- We need to use a `pipe` built into Nest although we can do this manually as well.
- We will use the `ValidationPipe` middleware in the following way:
    
    ```tsx
    import { ValidationPipe } from '@nestjs/common';
    
    async function bootstrap() {
      const app = await NestFactory.create<NestFastifyApplication>(
        MessagesModule,
        new FastifyAdapter(),
      );
      app.useGlobalPipes(new ValidationPipe());
      await app.listen(3000);
    }
    bootstrap();
    ```
    
- The `ValidationPipe` module requires the `class-transformer` and `class-validator` as dependencies
    
    ```bash
    pnpm add class-validator class-transformer
    ```
    

## Setting up Auto Validation

1. Tell NEST to use global validation (as above, do once)
2. Create a class that describes the different properties that the request body should have
3. Add validation rules to the class
4. Apply that class to the request handler

#### Data Transfer Object (DTO)

- A class that describes the different properties that the request body should have
- Create `src/messages/dtos/create-message.dto.ts`
    
    ```bash
    export class CreateMessageDto {
      content: string;
    }
    ```
    

#### Class Validator

- Requires the `class-validator` package to actually define the constraints
- Define the constraint:
    
    ```bash
    import { IsString } from 'class-validator';
    
    export class CreateMessageDto {
      @IsString()
      content: string;
    }
    ```
    

#### Apply the DTO

- Replace the type of the request body with the `DTO`:
    
    ```tsx
    // src/messages/message.controller.ts
    ...
    import { CreateMessageDto } from './dtos/create-message.dto';
    
    @Controller('messages')
    export class MessagesController {
      @Get()
      listMessages() {}
    
      @Post()
      createMessage(@Body() body: CreateMessageDto) {
        console.log(body);
      }
    
      @Get('/:id')
      getMessage(@Param('id') id: string) {
        console.log(id);
      }
    }
    ```
    
- The following request now fails:
    
    ```tsx
    POST http://localhost:3000/messages
    
    {
    	"content": 1 // null or misspell `content`
    }
    
    // Response
    {
        "statusCode": 400,
        "message": [
            "content must be a string"
        ],
        "error": "Bad Request"
    }
    ```
    

## Behind the Scenes of Validation

- How does type checking take place at runtime? (TS only checks at compile time)
- DTOs carry data between two places
- NEST inserts the DTO between the content body and the route

#### `class-transformer`

- Package that converts a plain (literal) object and converts it to a class (constructor) object
- Check their README for more details:
    
    [class-transformer/README.md at develop · typestack/class-transformer](https://github.com/typestack/class-transformer/blob/develop/README.md)
    

#### `class-validator`

- Project by the same people as the `class-transformer` package
- Provides decorators for validating fields in a class

#### Flow

Request ⇒ class transformer transforms the request body into a DTO class ⇒ class validator validates the instance ⇒ if there are errors, respond immediately otherwise provide the body to the request handlerD

## Type Annotation as DTO?

- We annotate the type for the `body` as `CreateMessageDto` but this does not exist in the Compiled JS
- The compilation ought to convert:
    
    `addMesage(@Body() body: AddMessageDto) {}` to `addMessage(body) {}`
    
    The DTO information should have been lost!
    
- This behavior is enabled via the `emitDecoratorMetadata` and `experimentalDecorators` option in the `tsconfig.json`
- These flags preserve “some” type information in the compiled JS file
- Checking in the `dist/messages/message.controller.ts`, we see
    
    ```tsx
    __decorate([
        (0, common_1.Post)(),
        __param(0, (0, common_1.Body)()),
        __metadata("design:type", Function),
        **__metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto]),**
        __metadata("design:returntype", void 0)
    ], MessagesController.prototype, "createMessage", null);
    ```
    
    The underlined code tells JavaScript to validate the Body as type `CreateMessageDto`!
    

## Services vs Repositories

- Both are just classes
- Services
    1. place to put any business logic
    2. uses one or more repositories to find or store data
- Repository
    1. place to put storage-related logic
    2. usually ends up being a TypeORM entity or a Mongoose Schema or similar, so we don’t have to worry about it
- Both may turn out to have very similar methods:
    - `MessagesService`:
        - `findOne(id: string)`
        - `findAll()`
        - `create(message: string)`
    - `MessageRepository`:
        - `findOne(id: string)`
        - `findAll()`
        - `create(message: string)`
    
    **This is fine and common!**
    
- A controller interacts with the service and the service in return interacts with the repository.
- A controller does not interact with the repository directly
- Services act as a proxy to interact with the Repository
- This becomes evident when a service needs to interact with multiple repositories.

## Repository

- Create `src/messages/message.repository.ts` first as `service` depends on it
- The repository should be able to read and write from a file so, we use the `fs/promises` package that provides the `readFile` and `writeFile` functions:
    
    ```tsx
    import { readFile, writeFile } from 'fs/promises';
    
    export class MessagesRepository {
      async findOne(id: string) {
        const contents = await readFile('messages.json', 'utf-8');
        const messages = JSON.parse(contents);
    
        return messages[id]; // unsafe; may return undefined/null
      }
    
      async findAll() {
        const contents = await readFile('messages.json', 'utf-8');
        const messages = JSON.parse(contents);
        return messages;
      }
    
      async create(content: string) {
        const contents = await readFile('messages.json', 'utf-8');
        const messages = JSON.parse(contents);
    
        const id = Math.floor(Math.random() * 999); // generate random IDs
    
        const newMessage = {
          id,
          content,
        };
    
        messages[`${id}`] = newMessage; // unsafe; can mutate existing keys
        await writeFile('message.json', JSON.stringify(messages));
    
    		return message;
      }
    }
    ```
    
- The above code assumes that a `messages.json` file exists at the root of the repository (with `{}`).

## Service

- The service `messages.service.ts` depends on the `messages.repository.ts` but we need to avoid any direct dependencies of this nature in Nest.
    
    ```tsx
    import { MessagesRepository } from './message.repository';
    
    export class MessagesService {
      constructor(
        protected messagesRepo: MessagesRepository = new MessagesRepository(),
      ) {}
    
      findOne(id: string) {
    		// TODO: Implement
    	}
    }
    ```
    
- DO NOT CREATE A DEPENDENCY IN THE CONSTRUCTOR
- Use `dependency Injection` instead (more on this later)!
- Define the methods (that invoke the repository):
    
    ```tsx
    	findOne(id: string) {
        return this.messagesRepo.findOne(id);
      }
    
      findAll() {
        return this.messagesRepo.findAll();
      }
    
      create(content: string) {
        return this.messagesRepo.create(content);
      }
    ```
    

## Attaching to the Controller

- Use the same structure as before:
    
    ```tsx
    import { Body, Controller, Get, Param, Post } from '@nestjs/common';
    
    import { CreateMessageDto } from './dtos/create-message.dto';
    import { MessagesService } from './messages.service';
    
    @Controller('messages')
    export class MessagesController {
      protected messagesService: MessagesService;
    
      //! use dependency injection instead
      constructor() {
        this.messagesService = new MessagesService();
      }
    
      @Get()
      listMessages() {
        return this.messagesService.findAll();
      }
    
      @Post()
      createMessage(@Body() body: CreateMessageDto) {
        return this.messagesService.create(body.content);
      }
    
      @Get('/:id')
      getMessage(@Param('id') id: string) {
        return this.messagesService.findOne(id);
      }
    }
    ```
    

## Reporting errors with Exceptions

- We can throw an error wrapped around with the right status message from `@nestjs/common`
- For example, if there is no `message` with the given id:
    
    ```tsx
    // src/messages/messages.controller.ts
    
    	@Get('/:id')
      async getMessage(@Param('id') id: string) {
        const message = await this.messagesService.findOne(id);
        if (!message) {
          throw new NotFoundException('message not found');
        }
    
        return message;
      }
    ```
    
    The response looks like the following:
    
    ```tsx
    {
        "statusCode": 404,
        "message": "message not found",
        "error": "Not Found"
    }
    ```
    

## Inversion of Control

- There are clear dependencies between the Controller, the Service and the Repository.
- Each component in the above code is creating its own dependency
- Inversion of Control
    - Classes should not create instances of its dependencies on its own (Dependency Inversion Principle)
- Bad Approach:
    
    ```tsx
    export class MessagesService {
    	messagesRepo: MessagesRepository
    
    	constructor () {
    		this.messagesRepo = new MessagesRepository()
    	}
    }
    ```
    
    Here, the `MessagesRepo` creates its own instance of the repository causing a direct dependency!
    
- Better Approach:
    
    ```tsx
    export class MessagesService {
    	messagesRepo: MessagesRepository;
    
    	constructor(repo: MessagesRepository) {
    		this.messagesRepo = repo;
    	}
    }
    ```
    
    Passing in an already existing copy of the repository.
    
- Best Approach:
    
    ```tsx
    interface Repository {
    	findONe(id: string);
    	findAll();
    	create(content: string);
    }
    
    export class MessagesService {
    	messagesRepository: Repository;
    
    	constructor(repo: Repository) {
    		this.messagesRepo = repo
    	}
    }
    ```
    
    Now, the classes are loosely coupled. This allows:
    
    - Writing test classes that do not have to be the Messages Repository. We only need a class that implements the interface that the service depends upon.

## Dependency Injection

- Take this code:
    
    ```tsx
    const repo = new MessagesRepository()
    const service new MessagesService(repo)
    const controlller = new MessagesController(service)
    ```
    
    **Three lines of code to just make a controller.**
    
    If the controller initialized the service itself (that in turn, would instantiate a repository), then, a single line of code would suffice. This makes the code unnecessarily verbose!
    
- NEST Dependency Injection (DI) Container / Injector:
    - Holds:
        - List of classes and their dependencies
        - List of instances that I have created
    - Starts up when the App starts up
    - We take our class and feed it into the Container
    - The Container, then analyzes the class (particularly the constructor)
- Example:
    - Classes and their dependencies created by the Container when we feed in the Controller:
        - Class ⇒ `MessagesService`, Dependency ⇒ `MessagesRepo`
        - Class ⇒ `MessagesRepo`, Dependency ⇒ `null`
    - When we tried to create a controller, it takes a look at the dependencies (from startup) and will create instances:
        - `messagesRepo` ⇒ `messagesService` ⇒ `messagesController`

<aside>
💡 DI Container Flow

1. At startup, register all classes with the container
2. Container will figure out what each dependency each class has
3. We then ask the container to create an instance of a class for us
4. Container creates all required dependencies and gives us the instance
5. Container will hold onto the created dependency instances and reuse them if needed.
</aside>

## Refactoring with DI

- For the services:
    
    ```tsx
    export class MessagesService {
      /////! use dependency injection instead!
      constructor(public messagesRepo: MessagesRepository) {}
    ...
    ```
    
- For the controller:
    
    ```tsx
    export class MessagesController {
      /////! use dependency injection instead
      constructor(public messagesService: MessagesService) {}
    ...
    ```
    
- For steps (1) and (2) in the DI Container Flow, we need to use the `Injectable` decorator on each class and add them to the modules list of providers
- Steps (3) and (4) happen automatically - NEST will try to create controller instances for us.
- For services:
    
    ```tsx
    // src/messages/messages.service.ts
    ...
    
    import { Injectable } from '@nestjs/common';
    
    // mark for registration with the DI Container
    @Injectable()
    export class MessagesService {
      /////! use dependency injection instead!
      constructor(public messagesRepo: MessagesRepository) {}
    ```
    
- For repository:
    
    ```tsx
    // src/messages/messages.repository.ts
    ...
    
    @Injectable()
    export class MessagesRepository {
      async findOne(id: string) {
        const contents = await readFile('messages.json', 'utf-8');
        const messages = JSON.parse(contents);
    
        return messages[id];
      }
    ...
    ```
    
- We do not need to inject the Controller directly as it only consumes classes.
- We are only to get NEST to create an instance of the Controller for us automatically
- Add the injected classes to the list of providers in the module:
    
    ```tsx
    // src/messages/messages.module.ts
    ...
    import { MessagesService } from './messages.service';
    import { MessagesRepository } from './message.repository';
    
    @Module({
      controllers: [MessagesController],
      // dependencies for other classes
    	// only one instance of these will be created throughout the Application
    	// but we can create unique copies as well (more on this later)
      providers: [MessagesService, MessagesRepository],
    })
    export class MessagesModule {}
    ```
    

## Footnotes

- It seems like we are using the **better** approach instead of the **best** approach
- Implementing the interface pattern is a bit tricky due to some caveats to TypeScript.
- Testing individual classes will be much simpler (more on this later)
- Only one instance of the providers will be created and can be tested simply with `console.log` by instantiating multiple copies of say, `MessagesRepository` inside a controller constructor.
