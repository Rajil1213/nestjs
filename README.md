# Used Car Pricing API
A simple App built with NestJS for selling used cars. This project is based on [this Udemy Course by Stephen Grider](https://www.udemy.com/course/nestjs-the-complete-developers-guide/). However, this project uses Fastify and includes a section on SWC (not present in the original course).

[View My Certificate](https://www.udemy.com/certificate/UC-dcbfe941-dcbd-44c5-ba01-88b13b36b23d/)


# Notes
## Design

#### Features

- Users sign up with email/password
- Users get an estimate for how much their car is worth based on the make/model/year/mileage
- Users can report what they sold their vehicles for
- Admins have to approve reported sales

#### Initial API Design

| Method and Route | Body or Query String | Description |
| --- | --- | --- |
| POST /auth/signup | Body: { email, password } | Create a new user and sign up |
| POST /auth/signin | Body: { email, password } | Sign in an existing user |
| GET /reports | Query: make, model, year, mileage, longitude, latitude | Get an estimate for the cars value |
| POST /reports | Body: { make, model, year, mileage, longitude, latitude, price } | Report how much a vehicle sold for |
| PATCH /reports | Body: { approved } | Approve or reject a report submitted by a user |

#### Initial Module Design

- Based on the routes, we might need two modules with the following structure:
    - `UsersModule`
        - `UsersController`
        - `UsersService`
        - `UsersRepository`
    - `ReportsModule`
        - `ReportsController`
        - `ReportsService`
        - `ReportsRepository`

#### Generate Files

- Create the new NEST project
    
    ```tsx
    nest new car-pricing
    ```
    
- Modules:
    
    ```tsx
    nest g module users
    nest g module reports
    ```
    
- Services:
    
    ```tsx
    nest g service users
    nest g service reports
    ```
    
- Controllers:
    
    ```tsx
    nest g controller users
    nest g controller reports
    ```
    

The created modules are imported in the App Module automatically.

## Persistent Data with DB

#### Introduction

- Use an actual database for persistence.
- We can use `TypeORM` or `Mongoose` but `TypeORM` works much better with NEST and supports a variety of SQL and NoSQL databases.
- For this project, we will use the `SQLite` database as it is lighter and easier to setup.

#### Setting up TypeORM and SQLite

```tsx
pnpm add @nestjs/typeorm typeorm sqlite3
```

#### Setting up a Database Connection

- Inside the App Module, we are going to create a connection to the sqlite database
- This connection will be shared across all the other modules.
- Within each module, we will create `Entities` that define our database models.
- NEST and TypeORM handles creating the Repository for us under the hood!
- Create the connection in the App Module:
    
    ```tsx
    
    import { TypeOrmModule } from "@nestjs/typeorm";
    
    @Module({
      imports: [
        ReportsModule,
        UsersModule,
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: "db.sqlite",
          entities: [],
          synchronize: true,
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    })
    ```
    
    Here, we call the `forRoot` method to create a connection at the root level that gets used down the chain. The config object passed into it will be explained later.
    
    Starting the server with `pnpm:dev` will create the `db.sqlite` file. TypeORM does this for us as sqlite is a file based database.
    

#### Creating Entity and Repository

- Entity:
    1. Create an entity file, and create a class in it that lists all the properties that your entity will have
        
        ```tsx
        // src/users/users.entity.ts
        
        import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
        
        @Entity()
        // okay to not append Entity to the name (community convention)
        export class User {
          @PrimaryGeneratedColumn()
          id: number;
        
          @Column()
          email: string;
        
          @Column()
          password: string;
        }
        ```
        
    2. Connect the entity to its parent module. This creates a repository
        
        ```tsx
        // src/users/users.module.ts
        
        import { TypeOrmModule } from "@nestjs/typeorm";
        import { User } from "./users.entity";
        
        @Module({
          imports: [TypeOrmModule.forFeature([User])],
          controllers: [UsersController],
          providers: [UsersService],
        })
        export class UsersModule {}
        ```
        
    3. Connect the entity to the root connection
        
        ```tsx
        // src/app.module.ts
        ...
        
        @Module({
          imports: [
            ReportsModule,
            UsersModule,
            TypeOrmModule.forRoot({
              type: "sqlite",
              database: "db.sqlite",
              entities: [User], // added `User` to this array
              synchronize: true,
            }),
          ],
          controllers: [AppController],
          providers: [AppService],
        })
        export class AppModule {}
        ```
        
- The repository is created automatically (from the entity we created) by `TypeORM` without the need for us to define anything explicitly

#### Understanding TypeORM decorators

- `synchronize`
    - A sql table has a very rigid structure
    - If we want to change this structure, we run “migrations” to alter the structure of the database:
        - add column
        - add table
        - rename column, table, etc.
    - We write migrations (here, sql code) to migrate the data
    - The `synchronize` feature is for use in dev environment
    - It looks at the actual sqlite database and run its migrations in such a way that the entity structure matches the actual table structure
- `Entity` decorator
    - makes sure that the table for the entity exists
    - creates the table if it does not exist
- `PrimaryGeneratedColumn` decorator
    - creates a primary key field for the decorated field
- `Column` decorator
    - creates a column for the decorated entity field

#### Overview of Repositories

- Repositories have a set of methods attached to them such as `create()`, `save()`, `remove()`, etc.
- More on these is available here:
    
    [https://typeorm.io/##/repository-api](https://typeorm.io/##/repository-api)
    

#### Additional Routes

The following routes will be added to better understand `TypeORM` along with their controllers and services:

| Method and Route | Body or Query String | Description | Controller | Service |
| --- | --- | --- | --- | --- |
| GET /auth/:id | - | Find a user with the given id | findUser | findOne |
| GET /auth/?email= | - | Find all users with the given email | findAllUsers | find |
| PATCH /auth/:id |  Body { email, password } | Update a user with the given id | updateUser | updateOne |
| DELETE /auth/:id | - | Delete user with a given id | removeUser | remove |

#### Setting up Body Validation

- Implement `/auth/signup` (POST)
    
    ```tsx
    import { Controller, Post } from '@nestjs/common';
    
    @Controller('auth')
    export class UsersController {
    
      @Post("signup")
      createUser() {
        
      }
    }
    ```
    
- And the DTO for validating the Body
    
    ```tsx
    // src/main.ts
    
    import { ValidationPipe } from "@nestjs/common";
    
    async function bootstrap() {
      const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
      );
    	// add the Validation Pipe
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true, // strips any extraneous field-values from the request body (say "admin": true)
        }),
      );
      await app.listen(3000);
    }
    bootstrap();
    ```
    
    (also add `class-validator` and `class-transformer` packages)
    
    Create the DTO:
    
    ```tsx
    import { IsEmail, IsString } from "class-validator";
    
    export class CreateUserDto {
      @IsEmail()
      email: string;
    
      @IsString()
      password: string;
    }
    ```
    

## Mutate User Data

#### Implement

- Implement the service that talks to the Repository (created by `TypeORM`):
    
    ```tsx
    import { Injectable } from "@nestjs/common";
    import { Repository } from "typeorm";
    import { User } from "./users.entity";
    import { InjectRepository } from "@nestjs/typeorm";
    
    @Injectable()
    export class UsersService {
      constructor(@InjectRepository(User) private repo: Repository<User>) {}
    
    	create(email: string, password: string) {
    		// create but don't persist to:
    		// make sure that the user can be created for the given parameters
    		// for example, when the Entity Class itself has some validation logic
        const user = this.repo.create({ email, password });
    		// save to the DB; persist
        return this.repo.save(user);
    	}
    }
    ```
    
    Here, 
    
    - `repo` is typed with a generic from `TypeORM`
    - `@InjectRepository` injects the repository since the DI system does not work well with generics.
- And the controller
    
    ```tsx
    // src/users/users.controller.ts
    
    @Controller("auth")
    export class UsersController {
      constructor(private usersService: UsersService) {}
    
      @Post("signup")
      createUser(@Body() body: CreateUserDto) {
        return this.usersService.create(body.email, body.password);
      }
    }
    ```
    

#### More on Create vs Save

- To demonstrate the difference, add logging hooks to the entity:
    
    ```tsx
    import {
      AfterInsert,
      AfterRemove,
      AfterUpdate,
      Column,
      Entity,
      PrimaryGeneratedColumn,
    } from "typeorm";
    
    @Entity()
    export class User {
      @PrimaryGeneratedColumn()
      id: number;
    
      @Column()
      email: string;
    
      @Column()
      password: string;
    
      @AfterInsert()
      logInsert() {
        console.log(`Inserted user with id: ${this.id}`);
      }
    
      @AfterUpdate()
      logUpdate() {
        console.log(`Updated user with id: ${this.id}`);
      }
    
      @AfterRemove()
      logRemove() {
        console.log(`Removed user with id: ${this.id}`);
      }
    }
    ```
    
- The hooks above are only executed when an entity is `create`d but not when they are `save`d
- Saving a plain object does not invoke the defined hooks.
- This difference between `create` and `save` can cause hard to debug issues.
- In the same vein, `inser()`, `update()` and `delete()` should also not be called directly. Instead, `save()` and `remoe()` should be used.

#### Services

- First, create all services and then, work on the routes/controllers.
- Implement services methods for: `find()`, `findOne()`, `update()` and `remove()`.
- Finding:
    
    ```tsx
    findOne(id: number) {
        return this.repo.findOne({ where: { id: id } }); // return User or null
    }
    
    find(email: string) {
        return this.repo.find({ where: { email: email } }); // return Array<User> or []
    }
    ```
    
- Updating:
    - We might want to update particular fields in the target object.
    - So, passing each property to the function is not ideal
    - So, we use the TS type annotation generic: `Partial<T>` that takes a partial keys for a type.
    - As discussed before, for the update hooks to work, we must `update` and then `save`.  The downside is that, we need two trips:
        - First, fetch the entry
        - Second, add the entry after mutating it
    
    ```tsx
    	async update(id: number, updateDoc: Partial<User>) {
        const user = await this.findOne(id);
    
        if (!user) {
          throw new NotFoundException(`User with id: ${id} not found`);
        }
    
        // copy over props
        Object.assign(user, updateDoc);
    
        return this.repo.save(user);
      }
    ```
    
- Deleting
    - Same as for updating: we can directly invoke the `delete()` method to save us a database trip but this will not invoke our hooks
    - The alternative is to have two round trips by first querying for the entity and removing it.
    
    ```tsx
    async remove(id: number) {
        const user = await this.findOne(id);
        if (user) {
          return this.repo.remove(user);
        }
    
        // if the user does not exist, it's already removed
        // an alternative is to throw an error
        return Promise.resolve(new User());
      }
    }
    ```
    

#### Controllers

- Finding
    - The param coming in for the `id` is always a string but our service expects a number. So, we must perform the appropriate conversion:
        
        ```tsx
        @Get(":id")
          // the id coming from the params is a string
          findUser(@Param("id") id: string) {
            const idAsNum = parseInt(id);
            if (Number.isNaN(idAsNum)) {
              throw new UnprocessableEntityException("param :id must be a number");
            }
        
            return this.usersService.findOne(idAsNum);
          }
        
          @Get()
          findAllUsers(@Query("email") email: string) {
            return this.usersService.find(email);
          }
        ```
        
        We can handle the conversion directly in the service itself because we might need to parse the `:id` param a number of times in different services that all depend on the `findOne()` service method.
        
- Removing:
    
    ```tsx
    // after moving the string-to-number conversion to `findOne()`
    @Delete(":id")
      removeUser(@Param("id") id: string) {
        return this.usersService.remove(id);
      }
    ```
    
- Updating:
    - We need to handle partial updates i.e., updates to a particular field in the user.
    - We need to create a DTO such that the fields are optional
    
    ```tsx
    // src/users/dtos/update-user.dto.ts
    import { IsEmail, IsOptional, IsString } from "class-validator";
    
    export class UpdateUserDto {
    	// must be an email but is optional
    	// order does not matter
      @IsEmail()
      @IsOptional()
      email: string;
    
      @IsOptional()
      @IsString()
      password: string;
    }
    ```
    
    ```tsx
    // src/users/users.controller.ts
    
    @Patch(":id")
    updateUser(@Param("id") id: string, @Body() updateUserDoc: UpdateUserDto) {
        return this.usersService.update(id, updateUserDoc);
    }
    ```
    

#### Handling Exceptions

- Nest cannot handle plan errors thrown with `throw new Error(<string>)`
- We should instead use the Error objects from `@nestjs/common`.
- These errors should not be handled by the service because:
    - an exception like `NotFoundException` cannot be handled by controllers such as `WebSocket` (need to use `wsException`) and `gRPC` ⇒ this makes scalability a problem
    - we need to instead implement an exception filter in our other controllers
- For our purposes, adding the exception in the `UsersService` is probably fine.

## Excluding Response Properties

- We might not want to return the password
- Follow the `Nest` Docs for how to handle these
- Here, we’ll use a more complicated but better custom solution
- Currently, the `user` is first obtained by the `usersService` and passed on to the `usersController` and then, finally as the response
- Flow:
    - Take the `user entity instance` from the `usersService` and convert it into a plain object based on some rules
    - Take the plain object from the `usersController` and serialize it with `class serializer interceptor` based on the rules defined above
    - i.e,
        - `usersService` ⇒ `user entity instance` ⇒ `<convert>` ⇒ `usersController` ⇒ `class serializer interceptor` ⇒ `json` response

#### NEST-Recommended Way

- An `Exclude` decorator is provided by the `class-transformer` package to exclude some properties
- In this case, the `password` property from the `User` object
    
    ```tsx
    // src/users/user.entity.ts
    import { Exclude } from "class-transformer";
    	
    @Exclude()
    @Column()
    password: string;
    ```
    
- Then, we invoke an `interceptor` on the required route with the `useInterceptor` decorator along with the `ClassSerializerInterceptor`:
    
    ```tsx
    import {
    	...,
    	UseInterceptors,
    	ClassSerializerInterceptor
    }
    
    @UseInterceptors(ClassSerializerInterceptor)
      @Get(":id")
      // the id coming from the params is a string
      findUser(@Param("id") id: string) {
        return this.usersService.findOne(id);
      }
    ```
    

#### Downsides to The Recommended Way

- We might add more properties some of which should be visible to some users and invisible to others.
- One solution is to add separate route
- But there may be other users that need to view some specific fields
- So, the `Exclude()` directive must be customized for various routes which may not be possible.

#### Custom Way

- Remove the `Exclude()` decorator entirely
- Use a custom interceptor with a `DTO` on the object returned from the Controller.

#### Understanding Interceptors

- Intercept incoming requests or outgoing responses
- Similar to middlewares in some other frameworks
- We create a `Interceptor` class that contains a method that is specifically called `intercept(context: ExecutionContent, next: CallHandler)`.
- The `next` is an `rxjs` [observable](https://youtu.be/Tux1nhBPl_w) ⇒ kind of the request handler in our controller

#### Implementing the Interceptor

- Create a file called `src/interceptors/serialize.interceptor.ts`
- We create a class called `SerializeInterceptor` that **implements** the `NestInterceptor` from `@nestjs/common`.
- Using `implement` allows TS to help us with the implementation

###### Inspection

- First, let’s put some `console.log` statements in the interceptor just to understand the execution flow:
    
    ```tsx
    // src/interceptors/serialize.interceptor.ts
    
    import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
    import { Observable, map } from "rxjs";
    
    export class SerializeInterceptor implements NestInterceptor {
      intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
        // run something before a request is handled by a request handler
        console.log("running before the handler", context);
    
        return handler.handle().pipe(
          map((data: any) => {
            // Run something before the respsone is sent out
            console.log("running before the response is sent", data);
          }),
        );
      }
    }
    
    ```
    
    In the controller, we invoke the interceptor:
    
    ```tsx
    	@UseInterceptors(SerializeInterceptor)
      @Get(":id")
      // the id coming from the params is a string
      findUser(@Param("id") id: string) {
        console.log("handler is running");
        return this.usersService.findOne(id);
      }
    ```
    
    When calling the route, we get:
    
    ```tsx
    running before the handler ExecutionContextHost {
      args: [
        Request {
          id: 'req-1',
          params: [Object],
          raw: [IncomingMessage],
          query: {},
          log: [Object],
          body: undefined,
          [Symbol(fastify.context)]: [Context],
          [Symbol(fastify.RequestPayloadStream)]: [IncomingMessage]
        },
        Reply {
          raw: [ServerResponse],
          request: [Request],
          log: [Object],
          [Symbol(fastify.reply.serializer)]: null,
          [Symbol(fastify.reply.errorHandlerCalled)]: false,
          [Symbol(fastify.reply.isError)]: false,
          [Symbol(fastify.reply.isRunningOnErrorHook)]: false,
          [Symbol(fastify.reply.headers)]: {},
          [Symbol(fastify.reply.trailers)]: null,
          [Symbol(fastify.reply.hasStatusCode)]: true,
          [Symbol(fastify.reply.startTime)]: undefined
        },
        undefined
      ],
      constructorRef: [class UsersController],
      handler: [Function: findUser],
      contextType: 'http'
    }
    handler is running
    running before the response is sent User { id: 3, email: 'tester@tester.com', password: '12345' }
    ```
    

###### Actual Implementation

- The Interceptor is going to convert the User Entity Instance (`User {}` in the `console.log()` output) into a `User DTO Instance`.
- The DTO is going to `expose` certain fields:
    
    ```tsx
    import { Expose } from "class-transformer";
    
    export class UserDto {
      @Expose()
      id: number;
    
      @Expose()
      email: string;
    }
    ```
    
- In the serializer, we are going to first transform the user entity instance to the above DTO:
    
    ```tsx
    import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
    import { plainToInstance } from "class-transformer";
    import { Observable, map } from "rxjs";
    import { UserDto } from "src/users/dtos/user.dto";
    
    export class SerializeInterceptor implements NestInterceptor {
      intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
        // run something before a request is handled by a request handler
    
        return handler.handle().pipe(
          map((data: any) => {
            // Run something before the respsone is sent out
            const serializable = plainToInstance(UserDto, data, {
              excludeExtraneousValues: true, // don't expose fields without `@Expose`
            });
            return serializable;
          }),
        );
      }
    }
    ```
    
    Note: `plainToClass` is deprecated in favor of `plainToInstance`.
    
- The DTO returned here is serialized by `Nest` itself.

###### Refactoring for Reusability

- We want to invoke the `SerializeInterceptor` to accept the whichever `DTO` class we want to pass like so:
    
    ```tsx
    	@UseInterceptors(new SerializeInterceptor(UserDto))
      @Get(":id")
      // the id coming from the params is a string
      findUser(@Param("id") id: string) {
        console.log("handler is running");
        return this.usersService.findOne(id);
      }
    ```
    
- So, we must update the interceptor with a constructor:
    
    ```tsx
    export class SerializeInterceptor implements NestInterceptor {
      constructor(private dto: any) {}
    
      intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
        // run something before a request is handled by a request handler
    
        return handler.handle().pipe(
          map((data: any) => {
            // Run something before the respsone is sent out
            const serializable = plainToInstance(this.dto, data, {
              excludeExtraneousValues: true, // don't expose fields without `@Expose`
            });
            return serializable;
          }),
        );
      }
    }
    ```
    
- The above implementation means that just to invoke the interceptor, we need to use three different imports.
- So, we are going to use a decorator to replace this line:
    
    ```tsx
    @UseInterceptors(new SerializeInterceptor(UserDto))
    ```
    
    with:
    
    ```tsx
    @Serialize(UserDto)
    ```
    
- The implementation looks like this:
    
    ```tsx
    // src/interceptors/serialize.interceptor.ts
    ...
    
    export const Serialize = (dto: any) => {
      return UseInterceptors(new SerializeInterceptor(dto));
    };
    ```
    
- We can apply the above decorator to each of the routes or apply the decorator directly to the controller so that it intercepts all outgoing requests from that route.
    
    ```tsx
    @Controller("auth")
    @Serialize(UserDto)
    export class UsersController {
    	...
    }
    ```
    
- Removing `any`
    - Decorators with types is generally not an easy integration in TypeScript
    - So, for now, let’s just enforce a type that the `Serialize` decorator can accept.
    
    ```tsx
    interface ClassContructor {
      new (...args: any[]): {};
    }
    
    export const Serialize = (dto: ClassContructor) => {
      return UseInterceptors(new SerializeInterceptor(dto));
    };
    ```
    

## Authentication

#### Overview

- `POST /auth/signup` ⇒ check if the email is already in use and return an error if it is ⇒ encrypt the user’s password ⇒ store the new user record ⇒ send back a cookie that contains the user’s id
- The browser automatically stores the cookie and attaches it to follow up requests
- For subsequent requests: checks if the cookie is valid ⇒ look at the user ID ⇒ (check if the user is allowed to make this request)
- The above can either be handled by:
    1. the `UsersService` itself or,
    2. a new service called `AuthService` that handles `SignUp` and `SignIn`.
- For scalability, the second option is the better option as we might need more features in the future such as password reset, external authentication, etc.

#### Auth Service

- We will create a new auth service for the `user` module
    
    ```tsx
    nest g service users/auth --flat
    ```
    
    - The `--flat` option prevents a directory called `auth` to be created inside the `users` path.
    - This invocation automatically adds the `AuthService` to the `users.module` as providers:
    
    ```tsx
    // src/users/auth.service.ts
    
    import { Injectable } from "@nestjs/common";
    
    import { UsersService } from "./users.service";
    
    @Injectable()
    export class AuthService {
      constructor(private usersService: UsersService) {}
    }
    ```
    

#### Signup

- See if an email is being used
- Hash the new password
    - Most hashing functions are already implemented for Node
    - Properties of a hash function:
        - Same input = Same output
        - Slight change in input ⇒ Very different output
        - Irreversible
    - Rainbow Attack
        - Calculate hash of common passwords and store that it in a table
        - Then, check leaked hashes and find the original password
    - Remedy is to use a `salt` ⇒ a randomly generated string
        - The salt is appended to the password and generate the new hash
        - The new hash is then appended with the original salt ⇒ hash and salted password
        - To get the password, a rainbow table has to be generated for each possible salt!
    - Here, we will use `bcrypt` which is slower but more secure and adaptive than `scrypt` that Stephen uses in the course. It also has salting by default and uses promises (no need for `promisify`):
        
        ```tsx
        pnpm add bcrypt
        pnpm add @types/bcrypt -D
        ```
        
- Save the user and return it
    
    ```tsx
    	async signup(email: string, password: string) {
        // see if an email already exists
        const users = await this.usersService.find(email);
        if (users.length > 0) {
          throw new BadRequestException("email already in use");
        }
    
    		// hash the password
        const rounds = 10; // generate salt automatically from these many rounds
        const hashedPassword = await bcrypt.hash(password, rounds);
    
    		// create and save the new user
        return this.usersService.create(email, hashedPassword);
      }
    ```
    

#### Sign in

- Take the email and password from the request
- Verify the input password hash with the one stored in the db for the given `email`
    
    ```tsx
    	async signin(email: string, password: string) {
        const [user] = await this.usersService.find(email);
        if (!user) {
          throw new NotFoundException(`user with email: ${email} not found`);
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
    
        if (!isPasswordValid) {
          throw new UnauthorizedException("wrong email/password combination");
        }
    
        return user;
    	}
    ```
    
- Send a cookie with the user id if valid i.e, create a session
    - The course uses the `cookie-session` library for express but for `fastify`, we will be using `@fastify/secure-session` as present in the Nest documentation:
        
        [https://docs.nestjs.com/techniques/session##use-with-fastify](https://docs.nestjs.com/techniques/session##use-with-fastify)
        
    - Test:
        - To test the usage, add the following to the `users.controller.ts`:
            
            ```tsx
            
            // src/users/users.controller.ts
            import { Session as secureSession } from "@fastify/secure-session";
            
            import {
            	...,
            	Session,
            } from "@nestjs/common";
            
            ...
            export class UsersController {
            	...	
            
            	@Get("/colors/:color")
              setColor(@Param("color") color: string, @Session() session: secureSession) {
                session.set("color", color);
              }
            
              @Get("/colors")
              getColor(@Session() session: secureSession) {
                return session.get("color");
            	}
            	...
            }
            
            ```
            
    - Actual
        
        ```tsx
        	@Post("signup")
          async createUser(
            @Body() body: CreateUserDto,
            @Session() session: secureSession,
          ) {
            const user = await this.authService.signup(body.email, body.password);
            session.set("userId", user.id);
            return user;
          }
        
          @Post("signin")
          async signInUser(
            @Body() body: CreateUserDto,
            @Session() session: secureSession,
          ) {
            const user = await this.authService.signin(body.email, body.password);
            session.set("userId", user.id);
            return user;
          }
        ```
        
    - We can now create a protected route:
        
        ```tsx
        	@Get("whoami")
          whoAmI(@Session() session: secureSession) {
            const userId = session.get("userId");
            if (!userId) {
              throw new BadRequestException("session cookie missing/invalid");
            }
            return this.usersService.findOne(session.get("userId"));
          }
        ```
        

#### Sign Out

- For this, we simply delete the session:
    
    ```tsx
    	@Post("signout")
      signOut(@Session() session: secureSession) {
        session.delete();
      }
    ```
    

#### Some Automation Tools

- We are going to create two tools that:
    - can reject requests to certain handles/routes if the user is not signed in ⇒ `Guard`
    - automatically tell a handler who the currently signed user is ⇒ `Interceptor + Decorator`

#### Custom Interceptor + Decorator

- A param decorator called `@CurrentUser` that returns the current user.
- We’ll used the `createParamDecorator` from `@nestjs/common`.
- We inspect the incoming request via the `ExecutionContext` (http, grpc, ws, etc.) from `@nestjs/common`.
- Basics:
    
    ```tsx
    // src/users/decorators/current-user.decorator.ts
    import {
      createParamDecorator,
      ExecutionContext,
    } from "@nestjs/common";
    
    export const CurrentUser = createParamDecorator(
      (data: string, context: ExecutionContext) => {
        return `Hi, ${data}`;
      },
    );
    ```
    
    ```tsx
    	@Get("whoami")
      whoAmI(@CurrentUser("there") user: string) {
        return user;
      }
    ```
    
    This route now just returns `Hi, there!`.
    
    If we don’t want any `data` (as in our case), we annotate with `never` and call the decorator without any params.
    
- Actual:
    - We need to use both the session and the users service.
    - To get the session is simpler:
        
        ```tsx
        import { Session } from "@fastify/secure-session";
        import {
          createParamDecorator,
          ExecutionContext,
        } from "@nestjs/common";
        
        export const CurrentUser = createParamDecorator(
          (data: never, context: ExecutionContext) => {
            const request = context.switchToHttp().getRequest(); // this is`any`
            console.log((request.session as Session).get("userId"));
            return "Hi, there!";
          },
        );
        ```
        
    - To interact with the `usersService` we need help from the DI container but is not accessible from the decorator.
    - So, we need an interceptor to provide our decorator with the data
        
        ```tsx
        // users/interceptors/current-user.interceptor.ts
        @Module({
          imports: [TypeOrmModule.forFeature([User])],
          controllers: [UsersController],
          providers: [UsersService, AuthService, CurrentUserInterceptor],
        })
        import { Observable } from "rxjs";
        
        import { Session } from "@fastify/secure-session";
        import {
          CallHandler,
          ExecutionContext,
          Injectable,
          NestInterceptor,
        } from "@nestjs/common";
        
        import { UsersService } from "../users.service";
        
        @Injectable() // because we need to inject the UsersService
        export class CurrentUserInterceptor implements NestInterceptor {
          constructor(private usersService: UsersService) {}
        
          async intercept(
            context: ExecutionContext,
            next: CallHandler<any>,
          ): Promise<Observable<any>> {
            const request = context.switchToHttp().getRequest();
            const session = request.session as Session;
        
            if (session) {
              const userId = session.get("userId");
        
              if (userId) {
                const user = await this.usersService.findOne(userId);
                request.currentUser = user || {};
              }
            }
        
            return next.handle();
          }
        }
        ```
        
    - We need to connect this interceptor to our decorator by adding it to the `providers` array
        
        ```tsx
        @Module({
          imports: [TypeOrmModule.forFeature([User])],
          controllers: [UsersController],
          providers: [UsersService, AuthService, CurrentUserInterceptor],
        })
        ```
        
    - We then need to use the interceptor in our controller:
        
        ```tsx
        @Controller("auth")
        @Serialize(UserDto)
        @UseInterceptors(CurrentUserInterceptor)
        export class UsersController {
          constructor(
            private usersService: UsersService,
            private authService: AuthService,
          ) {}
        
        	...
        	@Get("whoami")
          whoAmI(@CurrentUser() user: UserDto) {
            return user;
        	}
        ```
        
    - The downside to this approach is that the interceptor is scoped to our users controller, so if we need it elsewhere, we will have to use all the lines above which is cumbersome.
    - Better approach: use global interceptor with `APP_INTERCEPTOR` from `@nestjs/core`in our `users.module.ts`:
        
        ```tsx
        import { Module } from "@nestjs/common";
        import { APP_INTERCEPTOR } from "@nestjs/core";
        import { TypeOrmModule } from "@nestjs/typeorm";
        
        import { AuthService } from "./auth.service";
        import {
          CurrentUserInterceptor,
        } from "./interceptors/current-user.interceptor";
        import { UsersController } from "./users.controller";
        import { User } from "./users.entity";
        import { UsersService } from "./users.service";
        
        @Module({
          imports: [TypeOrmModule.forFeature([User])],
          controllers: [UsersController],
          providers: [
            UsersService,
            AuthService,
            {
              provide: APP_INTERCEPTOR,
              useClass: CurrentUserInterceptor,
            },
          ],
        })
        export class UsersModule {}
        ```
        
    - But this will lead to over-fetching of the user information.

#### Auth Guard

- We create a guard that implements `CanActivate` from `@nestjs/common`.
    
    ```tsx
    // src/guards/auth.guard.ts
    
    import { Session } from "@fastify/secure-session";
    import {
      CanActivate,
      ExecutionContext,
    } from "@nestjs/common";
    
    export class AuthGuard implements CanActivate {
      canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const userId = (request.session as Session).get("userId");
    
        return userId;
      }
    }
    ```
    
- We can then use it in our protected routes, for example:
    
    ```tsx
    // src/users/users.controller.ts
    ...
    import { UseGuards } from "@nestjs/common";
    
    ...
    	@UseGuards(AuthGuard)
      @Get("whoami")
      whoAmI(@CurrentUser() user: UserDto) {
        return user;
    	}
    ```
    
- Now, when we try to access the `whoami` route without a valid session, we get:
    
    ```tsx
    {
        "statusCode": 403,
        "message": "Forbidden resource",
        "error": "Forbidden"
    }
    ```
    

## Unit Testing

#### Introduction

- Unit Testing
    - Make sure that individual methods on a class are working correctly
- Integration Testing
    - Test the full flow of a feature
- We will be using `jest` that is provided by `Nest`.
- Vitest cannot be used because it relies on `esbuild` that does not support `emitDecoratorMetadata`. We need `swc` installed for this. (even with `swc` discussed later, the e2e tests did not work).
- The problem with working on services:
    - Services depend on other services that in turn, depend upon other services.
    - So, testing one service requires a lot of service
- The trick is to mock the dependent services.
- For example, a mock UsersService to test the AuthService.
- We wil create a testing DI container

#### Setup

- If the `auth.service` was created via `nest-cli`, the spec file should have already been configured with:
    
    ```tsx
    import { Test, TestingModule } from "@nestjs/testing";
    
    import { AuthService } from "./auth.service";
    
    describe("AuthService", () => {
      let service: AuthService;
    
      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [AuthService],
        }).compile(); // creates our own DI container
    
        service = module.get<AuthService>(AuthService);
      });
    
      it("should be defined", () => {
        expect(service).toBeDefined();
      });
    });
    ```
    
- The above test fails when we run `pnpm run test:watch`. (we can use the `p` command to enter `auth` as the pattern to just run the `auth.spec`):
    
    ```tsx
    AuthService › should be defined
    
        Nest can't resolve dependencies of the AuthService (?). Please make sure that the argument UsersService at index [0] is available in the RootTestModule context.
    ```
    
- To resolve this, we create a mock users Service:
    
    ```tsx
    	beforeEach(async () => {
        // mock the users service
        const mockUsersService = {
          find: () => Promise.resolve([]),
          create: (email: string, password: string) =>
            Promise.resolve({ id: 1, email, password }),
        };
    
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            AuthService,
            {
              provide: UsersService,
              useValue: mockUsersService,
            },
          ],
        }).compile();
    
        service = module.get<AuthService>(AuthService);
      });
    ```
    

#### What’s Happening?

- The providers array contains a list of classes that we want to inject into our other classes.
- The providers get registered into our DI Container
- The above code means to tell the DI container that when a class asks for the `UsersService`, give them the `mockUsersService`.

#### Getting TypeScript to Help with Mocks

- Why define only `find` and `create`?
    - Because the `AuthService` only uses these so these definitions suffice
- Right now, however, TS is not ensuring that we are providing the right value for `useValue`. We can pass in anything!
- We can add type annotation to our mock service with `Partial<UsersService>`.
- We will get an error for the `create()` method because it does not have hooks. So, we add explicit type conversion:
    
    ```tsx
    		// mock the users service
        const mockUsersService: Partial<UsersService> = {
          find: () => Promise.resolve([]),
          create: (email: string, password: string) =>
            Promise.resolve({ id: 1, email, password } as User),
        };
    ```
    
- To speed up tests use the following in the `package.json` file:
    
    ```tsx
    "test:watch": "jest --watch --maxWorkers=1"
    ```
    

#### Creating Tests for the Auth Service

- Ensure that the password is hashed!
    
    ```tsx
    it("creates a hashed and salted password", async () => {
        const email = "test@test.com";
        const password = "password";
        const user = await service.signup(email, password);
    
        expect(user.password).not.toEqual(password);
        expect(bcrypt.compareSync(password, user.password)).toBeTruthy();
        expect(bcrypt.compareSync("some random value", user.password)).toBeFalsy();
      });
    ```
    
- Ensure that an exception is thrown if a user signs in with an email that is already in use. For this, we need to create a variant of the `UsersService` that returns a user instead of an empty list. So, we need to override the `find()` method and for this, we need to define the `mockUsersService` outside the `beforeEach` block:
    
    ```tsx
    	it("throws a BadRequestException if the user signs in with an email that is in use", async () => {
        // create an email that is in use
        const email = "existingmail@test.com";
        const password = "password";
        mockUsersService.find = () => {
          return Promise.resolve([{ email, password, id: 1 } as User]);
        };
    
        await expect(service.signup(email, password)).rejects.toThrow(
          BadRequestException,
        );
      });
    ```
    
- Ensure that an Unauthorized Exception is returned if the entered password is wrong. This will require that we have password hash:
    
    ```tsx
    	it("throws an UnauthorizedException if a wrong password is provided", async () => {
        const email = "test@test.com";
        const password = "actualPassword";
        const hashedPassword = await bcrypt.hash(password, 10);
    
        mockUsersService.find = () => {
          return Promise.resolve([
            { id: 1, email, password: hashedPassword } as User,
          ]);
        };
    
        await expect(service.signin(email, "wrongPassword")).rejects.toThrow(
          UnauthorizedException,
        );
      });
    ```
    
- Ensure that a valid user object is returned if the supplied credentials are valid:
    
    ```tsx
    	it("retuns a user if the signin password is correct", async () => {
        const email = "test@test.com";
        const password = "actualPassword";
        const hashedPassword = await bcrypt.hash(password, 10);
    
        mockUsersService.find = () => {
          return Promise.resolve([
            { id: 1, email, password: hashedPassword } as User,
          ]);
        };
    
        await expect(service.signin(email, password)).resolves.toMatchObject({
          id: 1,
          email,
        });
    	});
    ```
    

#### More Intelligent Mocks

- Let’s add additional functionality to the `mockUsersService` so  that we don’t have to override methods or hash passwords for test case
- We’ll make the service a bit more realistic (although everything will still be in-memory):
    
    ```tsx
    	beforeEach(async () => {
        // mock the users service
        const users: Array<User> = [];
        mockUsersService = {
          find: (email: string) => {
            return Promise.resolve(users.filter((user) => user.email === email));
          },
          create: (email: string, password: string) => {
            const user = {
              id: Math.floor(Math.random() * 10000),
              email,
              password,
            } as User;
            users.push(user);
            return Promise.resolve(user);
          },
        };
    ```
    
    Then, in the test, we can simply call `signin`:
    
    ```tsx
    	it("retuns a user if the signin password is correct", async () => {
        const email = "test@test.com";
        const password = "actualPassword";
    
        await service.signup(email, password);
    
        await expect(service.signin(email, password)).resolves.toMatchObject({
          email,
        });
      });
    ```
    
    We can update the other tests accordingly.
    
    #### Testing the Users Controller
    
    - Has two services: `AuthService` and `UsersService`. So, two different mocks
    - But most methods just call on a service so there is not much to test
    - Testing a decorator in Nest and TypeScript in general is pretty difficult. We rely on end-to-end tests for this purpose.
    - Mocks:
        
        ```tsx
        		mockUsersService = {
              findOne: (id: string) =>
                Promise.resolve({
                  id,
                  email: "test@test.com",
                  password: "password",
                } as unknown as User),
              find: (email: string) =>
                Promise.resolve([
                  {
                    id: 1,
                    email,
                    password: "password",
                  } as unknown as User,
                ]),
            };
        
            mockAuthService = {};
        ```
        
    - The controller does not have much logic in it. So unit testing it is not that important. But we can create some tests, for example:
        
        ```tsx
        	it("findUser returns a single user with the given id", async () => {
            const user = await controller.findUser("1");
            expect(user).toBeDefined();
            expect(user).toMatchObject({
              id: "1",
            });
        	});
        ```
        
    - One of the methods that does have a logic is the `signin` route that contains some logic to manipulate the session object. The session object itself has to be mocked to achieve the desired functionality:
        
        ```tsx
        	it("signInUser updates session object and returns user", async () => {
            const mockStore = {} as any;
            const mockSession: Partial<Session> = {
              set: (key: any, value: any) => {
                mockStore[key] = value;
              },
        
              get: (key: any) => {
                return mockStore[key];
              },
            };
            const user = await controller.signInUser(
              { email: "test@test.com", password: "password" },
              mockSession as unknown as Session,
            );
        
            expect(user.id).toBe(1);
            expect(mockStore).toHaveProperty("userId");
            expect(mockStore["userId"]).toBeDefined();
            expect(mockStore["userId"]).toBe(1);
          });
        ```
        

#### Testing the Users Service

- The `users.service.spec.ts` file fails because it depends on the `UserRepository` that is provided by `TypeORM`
- Since we are not the ones who create the Repository, we cannot mock it either.
- We instead inject the Repository with the `getRepositoryToken(<entity>)` function provided by `TypeORM`:
    
    ```tsx
    	beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            UsersService,
            {
              provide: getRepositoryToken(User),
              useValue: {},
            },
          ],
        }).compile();
    ```
    

## End-to-End Testing

#### Overview

- Uses the `Test Runner` that:
    - creates a new copy of the entire Nest App
    - listens on traffic to a randomly assigned port
    - receives request from the test file
- Every test will have a separate runner
- The runner will be shut down after the test completes

#### Setup

- We can run the end-to-end test with the `test/app.e2e-spec.ts` file that was auto-generated by the nest CLI.
- This file works with express by default. To use Fastify, we need to add the following modifications:
    
    ```tsx
    	beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
        }).compile();
    
        app = moduleFixture.createNestApplication<NestFastifyApplication>(
          new FastifyAdapter(),
        );
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
      });
    	
    	// to close connection after each test
      afterEach(async () => {
    		const conn = getConnection();
        await conn.close();
      });
    ```
    
- The above fails with the following error:
    
    ```tsx
    [Nest] 65088  - 06/09/2023, 6:45:48 PM   ERROR [ExceptionsHandler] Cannot read properties of undefined (reading 'get')
    TypeError: Cannot read properties of undefined (reading 'get')
        at CurrentUserInterceptor.intercept (/Users/rajil/courses/nestjs/src/users/interceptors/current-user.interceptor.ts:29:36)
        at /Users/rajil/courses/nestjs/node_modules/.pnpm/@nestjs+core@9.4.2_@nestjs+common@9.4.2_reflect-metadata@0.1.13_rxjs@7.8.1/node_modules/@nestjs/core/interceptors/interceptors-consumer.js:23:36
    ```
    
    This is because `request.session` is undefined which in turn, is because the `@fastify/secure-session` plugin is registered in `main.ts` via the `bootstrap()` function that is not called by the test. The test simply calls the App Module itself (in the `beforeEach` block).
    
    So, we must refactor the registration step to a separate function and use it after the app initialization step:
    
    ```tsx
    // src/setup-plugins.ts
    import fastifyCsrf from "@fastify/csrf-protection";
    import secureSession from "@fastify/secure-session";
    import { ValidationPipe } from "@nestjs/common";
    import { NestFastifyApplication } from "@nestjs/platform-fastify";
    
    export const setupMiddleware = async (app: NestFastifyApplication) => {
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
        }),
      );
    
      await app.register(secureSession, {
        secret: "averylogphrasebiggerthanthirtytwochars",
        salt: "mq9hDxBVDbspDR6n",
        logLevel: "debug",
        cookieName: "nest_project_session",
        cookie: {
    			path: "/", // apply to the root path i.e, the domain and all its paths
          httpOnly: true,
          sameSite: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      });
    
      await app.register(fastifyCsrf, { sessionPlugin: "@fastify/secure-session" });
    };
    ```
    
    Then, in the test file (and almost identically in the `boostrap` function):
    
    ```tsx
    describe("AppController (e2e)", () => {
      let app: NestFastifyApplication;
    
      beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
        }).compile();
    
        app = moduleFixture.createNestApplication<NestFastifyApplication>(
          new FastifyAdapter(),
        );
        await setupMiddleware(app);
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
      });
    ```
    
    We might also want to edit our interceptor to use stronger types:
    
    ```tsx
    declare module "fastify" {
      interface FastifyRequest {
        currentUser: User | Record<string, never>; // Record for an empty object
      }
    }
    
    @Injectable()
    export class CurrentUserInterceptor implements NestInterceptor {
      constructor(private usersService: UsersService) {}
    
      async intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
      ): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const userId = request.session.get("userId");
    
        if (userId) {
          const user = await this.usersService.findOne(userId);
          request.currentUser = user || {};
        }
    
        return next.handle();
      }
    }
    ```
    
    #### Creating e2e Tests
    
    - The setup steps remain mostly the same
    - The actual test will test a certain method on a certain path:
        
        ```tsx
        	it("handles a signup request", () => {
            const email = "e2etest@test.com";
            return request(app.getHttpServer())
              .post("/auth/signup")
              .send({ email, password: "password" })
              .expect(201)
              .then((res) => {
                const { id, email: resEmail } = res.body;
                expect(id).toBeDefined();
                expect(resEmail).toBe(email);
              });
          });
        ```
        
    
    #### Alternative to `setup-plugins.ts`
    
    - An alternative to creating a separate function to setup plugins/middleware is to configure everything in the App Module itself. This is also Nest’s recommended way to doing things.
    - Setting up global pipes:
        
        ```tsx
        import {
          MiddlewareConsumer,
          Module,
          NestModule,
          ValidationPipe,
        } from "@nestjs/common";
        import { APP_PIPE } from "@nestjs/core";
        ...
        
        @Module({
          imports: [
            ReportsModule,
            UsersModule,
            TypeOrmModule.forRoot({
              type: "sqlite",
              database: "db.sqlite",
              entities: [User, Report],
              synchronize: true,
            }),
          ],
          controllers: [AppController],
          providers: [
            AppService,
            {
              provide: APP_PIPE,
              useValue: new ValidationPipe({
                whitelist: true,
              }),
            },
          ],
        })
        ```
        
    - If using `platform-express`, we can also configure the middleware inside the `AppModule` but this is not possible with `fastify` where we need to register plugins instead of using a middleware.
    
    #### Failures in Repeated Test Runs
    
    - Since we are using the same database for both `development` and `test`, the `signup` request is sent to create a new user
    - Subsequent requests then fail, because the user has already been created.
    - So, before running each of the tests (`it` blocks), we need to either wipe the existing DB or create a new one.
    - We will be using two databases: one for `development` and one for `testing`.
    - This allows us to wipe the database without affecting our development.
    - All we need to do is to change the configuration in the `TypeORM` config.
    - We can update the config based on some environment variable such as `NODE_ENV`.
    
    > NEST’s recommended way of handling environment config is incredibly over-the-top complicated
    > 
    
    — Stephen Grider
    
    ## Managing App Configuration
    
    #### Setup
    
    - Install the `@nestjs/config` package:
        
        ```tsx
        pnpm add @nestjs/config
        ```
        
    - This library depends on the `dotenv` package that reads the environment variables from either a `.env` file or those of the shell/process. The variables defined in `.env` is overwritten by the “normal” environment variables.
    - However, `dotenv` package:
        - rejects the use of multiple `.env` files
        - recommends not to commit the file to source control
        - does not specify how to use in deployment
    - We choose the NEST-recommended way instead
    
    #### Applying Dotenv for Config
    
    - We create two files: `.env.development` and `.env.test`.
        
        ```tsx
        DB_NAME=test.sqlite
        ```
        
    - The App module now needs an import for the `ConfigModule`:
        
        ```tsx
        import { ConfigModule } from "@nestjs/config";
        
        @Module({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true, // use everywhere
              envFilePath: `.env.${process.env.NODE_ENV}`,
            }),
        ...
        ```
        
    - And this needs to be injected into the TypeORM module:
        
        ```tsx
        import { ConfigModule, ConfigService } from "@nestjs/config";
        
        @Module({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true, // use everywhere
              envFilePath: `.env.${process.env.NODE_ENV}`,
            }),
            ReportsModule,
            UsersModule,
            TypeOrmModule.forRootAsync({
              inject: [ConfigService],
              useFactory: (config: ConfigService) => {
                return {
                  type: "sqlite",
                  database: config.get<string>("DB_NAME"),
                  synchronize: true,
                  entities: [User, Report],
                };
              },
            }),
          ],
        ...
        ```
        
    - We can also get the config from the `app` itself now with `app.get(ConfigService)`.
    - This is useful in getting the session secret from the `.env` file and also setting up the application port:
        
        ```tsx
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
        ```
        
    
    #### Specifying the Node Environment
    
    - For MacOS or Linux, this is as simple as appending the `NODE_ENV` value to each of the scripts:
        
        ```tsx
        "scripts": {
            "build": "nest build",
            "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
            "start": "NODE_ENV=development start",
            "start:dev": "NODE_ENV=development nest start --watch",
            "start:debug": "NODE_ENV=development nest start --debug --watch",
            "start:prod": "NODE_ENV=production node dist/main",
            "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
            "test": "NODE_ENV=test jest",
            "test:watch": "NODE_ENV=test jest --watch --maxWorkers=1",
            "test:cov": "NODE_ENV=test jest --coverage",
            "test:debug": "NODE_ENV=test node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
            "test:e2e": "NODE_ENV=test jest --config ./test/jest-e2e.json"
          },
        ```
        
    - For Windows (and for Linux and MacOS), there is a library called `cross-env`:
        
        ```tsx
        pnpm add cross-env
        ```
        
        Then, in the above scripts, we prepend `cross-env`:
        
        ```tsx
        "start": "cross-env NODE_ENV=development nest start"
        ```
        
    
    <aside>
    💡 make sure to add the `test.sqlite` and the `.env` files to `.gitignore`
    
    </aside>
    
    #### A Potential SQLite Error
    
    - Jest runs both the `app` and `auth` e2e tests at the same time
    - SQLite does not handle multiple connections well, so we might get a `SQLite` locked database error
    - We must therefore, tell Jest to not run tests in parallel. For TypeScript, this actually means that there is a speedup!
        
        ```tsx
        "test:e2e": "NODE_ENV=test jest --config ./test/jest-e2e.json --maxWorkers=1"
        ```
        
    
    #### Wiping the Database
    
    - Before every single test, we need to wipe the database either by:
        - Delete rows on each table in the database
        - Delete the entire database
    - We go with the second option and TypeORM handles recreating of the database.
    - For this, we define a **global** `beforeEach` by defining a param called `setupFilesAfterEnv` in the `test/jest-e2e.json` file:
        
        ```tsx
        {
          "moduleFileExtensions": ["js", "json", "ts"],
          "rootDir": ".",
          "testEnvironment": "node",
          "testRegex": ".e2e-spec.ts$",
          "transform": {
            "^.+\\.(t|j)s$": "ts-jest"
          },
          "setupFilesAfterEnv": ["<rootDir>/setup.ts"]
        }
        ```
        
        Here, `<rootDir>` references the `test` directory in our project root.
        
    
    #### One More Test
    
    - Let’s test the `/auth/whoami` route to check how to work with cokies:
        
        ```tsx
        it("retrieves the currently signed in user", async () => {
            const email = "e2etest@test.com";
            const password = "password";
        
            const res = await request(app.getHttpServer())
              .post("/auth/signup")
              .send({ email, password })
              .expect(201);
        
            const cookie = res.get("Set-Cookie");
        
            const { body } = await request(app.getHttpServer())
              .get("/auth/whoami")
              .set("Cookie", cookie)
              .expect(200);
        
            expect(body).toMatchObject({ email });
          });
        ```
        
    
    ## Relations with TypeORM
    
    #### Reports
    
    - Start by implementing the functionality/route to create reports based on the design specified above.
    
    #### Building Associations
    
    - Associate users with reports (who created a particular report)
    - About relating one record with another
    - We need to add a field to the reports table for the `user_id` field.
    
    #### Types of Associations
    
    - One-to-one:
        - Country ↔ Capital
        - Car ↔ Engine
    - One-to-Many or Many-to-one
        - Customers ↔ Orders
        - Car ↔ Parts
        - Country ↔ Cities
    - Many-to-Many
        - Trains ↔ Riders
        - Classes ↔ Students
        - Album ↔ Genre
    - For users and reports
        - One user can create many reports
        - One report is only ever created by one user
        - So, this relationship is one-to-many (users-to-reports)
    
    #### Associations with NEST and TypeORM
    
    - We can use the `OneToMany()` decorator from TypeORM
    - We add a field called `Reports` in the `User` entity.
    - And a corresponding `user` in the `Report` entity with the `ManyToOne` decorator
    - The `OneToMany` decorator does not induce any changes but the `ManyToOne` decorator causes a new field to be added to the `report` schema:
        
        ```tsx
        // src/users/users.entity.ts
        
        import { OneToMany } from "typeorm";
        
        @Entity()
        // okay to not append Entity to the name (community convention)
        export class User {
          @PrimaryGeneratedColumn()
          id: number;
        
          @OneToMany(() => Report, (report) => report.user)
          reports: Report[];
        
        	...
        ```
        
        ```tsx
        // src/reports/reports.entity.ts
        
        import { ManyToOne } from "typeorm";
        
        @Entity()
        export class Report {
          @PrimaryGeneratedColumn()
          id: string;
        
          @ManyToOne(() => User, (user) => user.reports)
          user: User;
        
        	...
        }
        ```
        
    - After these changes, the `db.sqlite` file has to be deleted!

#### More on Decorators

- User: `OneToMany`:
    - Does ***not*** change the Users Table
    - Reports tied to this user will be accessed with: `user.reports`
    - Association is not automatically fetched when we fetch a user
- Report: `ManyToOne`:
    - Changes the Reports Table
    - User who created the report can be accessed with: `report.user`
    - Association is not automatically fetched when we fetch a Report
- The first argument to these decorators is a function that returns the type of data that the field references:
    - A function is required because there is a circular dependency between the `User` and `Report` entities!
    - Whichever entity is executed first will be defined and the second one won’t be defined. So, a direct dependency will not work
    - The function gets executed when we access the field at which point the App will already have been initialized with all its dependencies.
- The second argument maps the related entity to the entity that it is related from.

#### Setting up the Association

- Behind the scenes, the report entity instance will have access to the user but the Reports Repository will extract only the ID of the associated user for the given report.
- Now, the `POST` request to the reports entity also needs the current user information.
    
    ```tsx
    // src/reports/reports.controller.ts
    
    	createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
        this.reportsService.create(body, user);
      }
    ```
    
- Then, we make the assignment within the service:
    
    ```tsx
    // src/reports/reports.service.ts
    
    	create(report: CreateReportDto, user: User) {
        const newReport = this.repo.create(report);
        newReport.user = user; // the repository extracts the `id`
        return this.repo.save(newReport);
      }
    ```
    
- The problem is that with the above setup, the password hash is also returned in the response!

#### Formatting the Reports Response

- By default, the whole `user` object is embedded within the report.
- We do not want to send out the entire object!
- We would instead prefer it to be `userId`
- The client can then retrieve more information if required.

#### Transforming the Response with a DTO

- First, we create the report DTO where in we specify the transformation for the `userId` field.
- We can specify fields that are not present in the actual response with this construct:
    
    ```tsx
    import { Expose, Transform } from "class-transformer";
    
    import { Report } from "../reports.entity";
    
    export class ReportDto {
      @Expose()
      id: number;
    
      @Expose()
      price: number;
    
      @Expose()
      year: number;
    	
    	...
    
      // obj => ref to the original report entity
    	@Transform(({ obj }: { obj: Report }) => obj.user.id)
      @Expose()
      userId: number;
    }
    ```
    
- Then, we can update the reports service to return this DTO:
    
    ```tsx
    	create(report: CreateReportDto, user: User) {
        const newReport = this.repo.create(report);
        newReport.user = user;
        return this.repo.save(newReport);
      }
    ```
    

## A Basic Permissions System

#### Adding in Report Approval

- We need to implement the `PATCH /reports/:id`.
- We add the following column to the `reports` entity:
    
    ```tsx
    	@Column({ default: false })
      approved: boolean;
    ```
    
- Then, we create a DTO that accepts `approve` in the request body as a boolean:
    
    ```tsx
    import { IsBoolean } from "class-validator";
    
    export class ApproveReportDto {
      @IsBoolean()
      approve: boolean;
    }
    ```
    
- Finally, we can create the required controller and the service:
    
    ```tsx
    	async approve(id: string, approve: boolean) {
        const report = await this.repo.findOne({ where: { id } });
        report.approved = approve;
        return this.repo.save(report);
      }
    ```
    
    ```tsx
    	@Patch(":id")
      approveReport(@Param("id") id: string, @Body() body: ApproveReportDto) {
        return this.reportsService.approve(id, body.approve);
      }
    ```
    

#### Authorization vs Authentication

- Make sure an `admin` user is present that can access the  `PATCH: reports/:id`
- Authentication ⇒ figure out who is making a request
- Authorization ⇒ figure out if the person making the request is authorized to do so
- So, we implement an `AdminGuard` similar to the `AuthGuard`.

#### An Authorization Guard

- We will create a Guard that checks if the user is an admin:
    
    ```tsx
    import { FastifyRequest } from "fastify";
    
    import { CanActivate, ExecutionContext } from "@nestjs/common";
    
    export class AdminGuard implements CanActivate {
      canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<FastifyRequest>();
    
        const user = req.currentUser;
        if (!user) return false;
    
        return user.admin;
      }
    }
    ```
    
- We can then, use it with:
    
    ```tsx
    	@Patch(":id")
      @UseGuards(AdminGuard)
      approveReport(@Param("id") id: string, @Body() body: ApproveReportDto) {
        return this.reportsService.approve(id, body.approve);
      }
    ```
    
- However, this does **not** work.

#### Middlewares, Guards and Interceptors

- The flow of request is as follows:
    
    Request ⇒ Middlewares ⇒ Guards ⇒ [Interceptor] ⇒ Request Handler ⇒ [Interceptor] ⇒ Response
    
- For our case, we have:
    
    Request ⇒ Cookie-Session Middleware ⇒ Admin Guard ⇒ Current User Interceptor ⇒ Request Handler ⇒ [DTO Interceptor] ⇒ Response
    
- So, our guard is running before the `currentUser` has been set by the Interceptor
- The solution is to convert the `current user` interceptor into a middleware!
- The middleware will then run before the Guard.

#### Assigning the Current User via a ~~Middleware~~ Guard

<aside>
⚠️ Setting up a middleware for Fastify  is possible but will not work for our purposes. NEST requires that for Fastify, we send in the http.IncomingMessage and not the `FastifyRequest` to the middleware. Without the actual request object, we cannot access the session property!

</aside>

- For Fastify, one solution is to extract the currentUser and in the Admin Guard itself:
    
    ```tsx
    export class AdminGuard implements CanActivate {
      constructor(@Inject(UsersService) private usersService: UsersService) {}
    
      async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<FastifyRequest>();
    
        const { userId } = req.session || { userId: "" };
    
        if (!userId) return Promise.resolve(false);
    
        const user = await this.usersService.findOne(userId);
    
        return Promise.resolve(user.admin);
      }
    }
    ```
    
- Since the guard is invoked from in the reports module but depends on the usersService, we must first export the `UserService` from the `UsersModule` and import the `UsersModule` in the `ReportsModule`.
    
    ```tsx
    @Module({
      imports: [TypeOrmModule.forFeature([User])],
      controllers: [UsersController],
      exports: [UsersService],
      providers: [
        UsersService,
        AuthService,
        {
          provide: APP_INTERCEPTOR,
          useClass: CurrentUserInterceptor,
        },
      ],
    })
    export class UsersModule {}
    ```
    
    ```tsx
    @Module({
      imports: [TypeOrmModule.forFeature([Report]), UsersModule],
      controllers: [ReportsController],
      providers: [ReportsService],
    })
    export class ReportsModule {}
    ```
    
- This is far from ideal and leads to duplicate database requests to get the current User.
- Another alternative is to add an `APP_GUARD` that changes the request object and then, always returns true:
    
    ```jsx
    export class CurrentUserGuard implements CanActivate {
      constructor(@Inject(UsersService) private usersService: UsersService) {}
    
      async canActivate(context: ExecutionContext): Promise<true> {
        const request = context.switchToHttp().getRequest();
    
        const userId = request.session.get("userId");
        console.log("inside CurrentUserGuard.canActivate", userId);
    
        if (userId) {
          console.log("setting current user");
          const user = await this.usersService.findOne(userId);
          request.currentUser = user || {};
        }
    
        // always return true, handle Auth via Auth Guard for specific routes
        return Promise.resolve(true);
      }
    }
    ```
    
    To inject the `UsersService`, we must export it from the `UsersModule` as before. Importing it in the `ReportsModule` is not required as it is imported at the `AppModule`.
    
- Also, make sure that you extend the `FastifyRequest` type to accommodate the `currentUser`:
    
    ```jsx
    // src/types/index.d.ts
    import { User } from "../users/users.entity";
    
    declare module "fastify" {
      interface FastifyRequest {
        currentUser: User | Record<string, never>; // empty object
      }
    }
    
    ```
    
- This guard runs before all interceptors and other guards.

#### Estimating Car Prices

- We need to implement the `GET /reports` endpoint that uses a query string that is similar to the body passed into `POST /reports`.
- So, we can copy over the DTO (mostly) from the post body to the query string dto (except for the price that we are trying to estimate).
- We can then, define the controller:
    
    ```jsx
    @Get()
      getEstimate(@Query() query: GetEstimateDto) {
        ...
      }
    ```
    
- This is not going to work because although our DTO defines certain values as `number` types, the values from the query string as well, strings!
- So, we need a decorator to transform certain strings to numbers

#### Transforming Query String Data

- We use the `Transform()` decorator
    
    ```jsx
    import { Transform } from "class-transformer";
    import {
      IsLatitude,
      IsLongitude,
      IsNumber,
      IsString,
      Max,
      Min,
    } from "class-validator";
    
    export class GetEstimateDto {
      @IsString()
      make: string;
    
      @IsString()
      model: string;
    
      @Transform(({ value }) => parseInt(value))
      @IsNumber()
      @Min(1930)
      @Max(2050)
      year: number;
    
      @Transform(({ value }) => parseInt(value))
      @IsNumber()
      @IsLatitude()
      lat: number;
    
    	// latitude/longitude can contain a period `.`
      @Transform(({ value }) => parseFloat(value))
      @IsNumber()
      @IsLongitude()
      lng: number;
    
      @Transform(({ value }) => parseFloat(value))
      @IsNumber()
      @Min(0)
      @Max(10000)
      mileage: number;
    }
    ```
    

#### Generating an Estimate

- We are going to create a simple albeit inaccurate estimate
- We search all `make,model` within +/- 5 degrees of the specified location, within 3 years and order by the closest mileage
- The above will generate a list of approved reports ⇒ average the top 3 and return
- This assumes that we already have a lot of data in our database.

#### Creating a Query Builder

- Get reports where make and model are the same as the query:
    
    ```jsx
    		async createEstimate({ make, model }: GetEstimateDto) {
    	    return await this.repo
    	      .createQueryBuilder("estimate")
    	      .select("*")
    	      .where("make = :make", { make: make }) // do not use raw string because SQLi
    	      // .where("model = :model", { model: model }) // this overrides the above where
    	      .andWhere("model = :model", { model })
    				.getRawMany();
    	  }
    ```
    
- For range, we take the difference and use the `DIFFERENCE` keyword:
    
    ```jsx
    			.andWhere("lng - :lng BETWEEN -5 AND 5", { lng })
          .andWhere("lat - :lat BETWEEN -5 AND 5", { lat })
          .andWhere("year - :year BETWEEN -3 and 3", { year })
    ```
    
- For, ordering, we use `orderBy` but it does not take a parameter. We need to pass the parameter separately:
    
    ```jsx
    			.orderBy("ABS(mileage - :mileage)", "DESC")
          .setParameters({ mileage })
    ```
    
- Fetching the average of the top 3 approved reports’ prices is achieved by setting a limit:
    
    ```jsx
    			.select("ROUND(AVG(price), 2)", "price") // column, alias
    			...
    			.andWhere("approved IS TRUE")
    			... // orderBy
    			.limit(3)
          .getRawOne();
    ```
    

## Deployment

#### Steps

- Replace `sqlite3` with `postgres` only for production

#### Understanding the `synchronize` flag

- With this flag set to true, TypeORM makes sure that the entity and its corresponding table are always in sync in terms of the schema (column name and the type).
- TypeORM handles adding/removing of columns based on the entity structure
- This is an extremely uncommon behavior and can be downright dangerous!
    - You accidentally delete a property in an entity and deploy it. TypeORM will then go ahead and apply those updates to the production environment

#### Migrations

- Migration ⇒ a file that contains two functions:
    - UP ⇒ describe how to update the structure of our DB e.g., add a new table called `users` with a column called `email` and `password`
    - DOWN ⇒ describe how to undo the steps in `UP` e.g., delete the `users` table created by `UP`.
- We can have multiple migration files and run them in sequence.

#### Migrations and Config Management

- Steps:
    - Stop the development server
    - Use the TypeORM CLI to generate an empty migration file
    - Add some code to change our DB in the migration file
    - Use the TypeORM CLI to apply the migration to the DB
    - DB is updated! Restart the development server
- Problems:
    - The TypeORM CLI needs to connect to the DB
    - We have done this in the NEST App Module but the CLI does not care about this
    - We need access to the `ConfigService`
    - We should not copy over the config

#### Problems Integrating NestJS Config and TypeORM CLI

- TypeORM documentation says that there are a couple of options to feed configurations to it.
- One such option is an `ormconfig.json` file
- This will get used both in the NEST App and the TypeORM CLI
- Another option is to use environment variables or a `.env` file
- We can also use a YAML, XML or TS file
- Unfortunately, none of these are gonna work with both the Application and the CLI
- `ormconfig.(json|yaml|xml)`
    - We cannot specify different config based on the environment
    - There is no way to configure this file or add logic to a static file
- Environment Variables
    - The deployment target may already have environment variables that tell us how to connect to their database
    - But TypeORM expects very specific environment variable keys
- `ormconfig.js`
    - We would want to write our logic to spit out the environment-specific config from these files
    - We would need to remove parameters from the `forRootAsync` call and replace it with `forRoot`. We would then, create a `ormconfig.ts` file:
        
        ```tsx
        // /ormconfig.ts
        export = {
        	type: "sqlite",
        	database: "db.sqlite",
        	entities: ["**/*.entity.ts"],
        	synchronize: false,
        }
        ```
        
        We get an error:
        
        > Unexpected token `export`
        > 
        
        This is because our application is actually running as plain `JS` files.
        
- `ormconfig.js`
    - We cannot use `export`.
    - We need to use `commonJS` construct: `module.exports = { ... }`
    - And, we get an error:
        
        > Cannot use import statement outside a module (in `report.entity.ts`)
        > 
        
        This is because we are loading entities from `entity.TS`!
        
        So, we must use: `**/*.entity.js`!
        
- But still, our `e2e` tests fail!
    - Because Nest transpiles everything to JS
    - But Jest uses `ts-jest` that does not transpile to JS and execute TS.
    - This means that for our tests, we could use `ormconfig.ts` file but this does not work in production!
- We must tell `ts-jest` to `allowJs`. We set `allowJS` to `true` in `tsconfig.json`
    
    > No repository for `User`
    > 
    
    This is because `ts-jest` is unable to find any `entity.js` files because it does not have access to `dist` where the transpiled code lives.
    
    To fix this:
    
    ```tsx
    module.exports = {
    	type: "sqlite",
    	database: "db.sqlite",
    	entities: process.env.NODE_ENV === "development" 
    						? [ "**/*.entity.js" ] 
    						: [ "**/*.entity.js "],
    	synchronize: false
    }
    ```
    

#### Env Specific Database Config

- We first the config based upon the `NODE_ENV` as follows:
    
    ```tsx
    var dbConfig = {
      synchronize: false,
    };
    
    switch (process.env.NODE_ENV) {
      case "development":
        Object.assign(dbConfig, {
          type: "sqlite",
          database: "db.sqlite",
          entities: ["**/*.entity.js"],
        });
        break;
      case "test":
        Object.assign(dbConfig, {
          type: "sqlite",
          database: "test.sqlite",
          entities: ["**/*.entity.ts"],
        });
        break;
      case "production":
        break;
      default:
        throw new Error("unknown environment");
    }
    
    module.exports = dbConfig;
    ```
    
- Unfortunately, this file will not be automatically used by `TypeORM` inside the `AppModule`. We need to explicitly import and then, use it i the App Module:
    
    ```tsx
    
    import * as dbConfig from "../ormconfig.js";
    
    @Module({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true, // use everywhere
          envFilePath: `.env.${process.env.NODE_ENV}`,
        }),
        TypeOrmModule.forRoot(dbConfig),
        ReportsModule,
        UsersModule,
      ],
      controllers: [AppController],
    ```
    
- Even with this, we are still faced with the issue that there are now two different types of config in our application:
    - one for the database
    - one for other parts of our application through the `.env` files.

#### Installing the TypeORM CLI

[https://typeorm.io/using-cli](https://typeorm.io/using-cli)

- Two ways to do this, one with JS and the other with TS
- This CLI cannot talk with typescript directly. So, we need to use `ts-node` and a script called `typeorm` with some configurations
- We then, call this script with `pnpm` with the actual commands we want to execute!

#### Generating and Running Migrations

[https://typeorm.io/migrations](https://typeorm.io/migrations)

- We need to add the `migrations` config to our `ormconfig.js`
- Note the following from the docs:
    
    > **`typeorm migration:create` and `typeorm migration:generate` will create `.ts` files, unless you use the `o` flag (see more in [Generating migrations](https://typeorm.io/migrations##generating-migrations)). The `migration:run` and `migration:revert` commands only work on `.js` files. Thus the typescript files need to be compiled before running the commands.** Alternatively you can use `ts-node` in conjunction with `typeorm` to run `.ts` migration files.
    > 
- As of typeorm version 0.3.x, the CLI actually fails. The issue is still open for over a year:
    
    [Generating migrations with cli · Issue ##8810 · typeorm/typeorm](https://github.com/typeorm/typeorm/issues/8810##issuecomment-1084495541)
    
- So, we need to actually downgrade the CLI to version `0.2.45` and `@nestjs/*` to `8.0.0`. But the `csrf` and `session` plugins do not work with this nest version so, we do not downgrade it.
- The script should have:
    
    ```tsx
    "typeorm": "NODE_ENV=development node --require ts-node/register ./node_modules/typeorm/cli.js"
    ```
    
    And invoked with:
    
    ```tsx
    pnpm -n init-schema -o
    ```
    
    This will generate the script to create the initial tables.
    
- Running:
    
    ```tsx
    pnpm typeorm migration:run
    ```
    
    This will execute the migrations in the `migrations/` directory. In this case, the new tables are made in the db based on the entity schema.
    

#### Migrations during e2e Tests

- As our tests run with TS, we need to set `allowJs` to `true` in our `tsconfig.json` file in order to allow using the `ormconfig.js` file.
- Then, we must run migrations before our tests because we delete the `db` before each test. So, we update the `ormconfig.js` as follows:
    
    ```tsx
    	case "test":
        Object.assign(dbConfig, {
          type: "sqlite",
          database: "test.sqlite",
          entities: ["**/*.entity.ts"],
          migrationsRun: true, // start for each individual test
        });
        break;
    ```
    

#### Production DB Config

- Go to heroku and setup the database:
    
    [Getting Started on Heroku with Node.js | Heroku Dev Center](https://devcenter.heroku.com/articles/getting-started-with-nodejs##set-up)
    
- Get the database URL and add the `pg` package (postgres driver) with `pnpm`
- The following config is required:
    
    ```tsx
    	case "production":
        Object.assign(dbConfig, {
          type: "postgres",
          url: process.env.DATABASE_URL, // set in env var
          migrationsRun: true,
          entities: ["**/*.entity.js"],
          ssl: {
            rejectUnauthorized: true, // for heroku
          },
        });
        break;
    ```
    
- Exclude the `ormconfig.js` from the `tsconfig.build.json`.
- Create a `Procfile` for Heroku.

## Extra Steps

#### SWC

<aside>
💡 For development use only

</aside>

- Install `Speedy Web Compiler` instead of `webpack` or `tsc`.
- This isn’t compatible with NestJS CLI plugins, so if you’re using one swc should not be installed.
- Installation
    
    ```tsx
    pnpm add @swc/cli @swc/core nodemon -D
    ```
    
- Add a config file `.swcrc`:
    
    ```tsx
    {
      "$schema": "https://json.schemastore.org/swcrc",
      "sourceMaps": true,
      "module": {
        "type": "commonjs"
      },
      "jsc": {
        "target": "es2017",
        "parser": {
          "syntax": "typescript",
          "decorators": true,
          "dynamicImport": true
        },
        "transform": {
          "legacyDecorator": true,
          "decoratorMetadata": true
        },
        "keepClassNames": true,
        "baseUrl": "./"
      },
      "minify": false
    }
    ```
    
- Then, add the following lines:
    
    ```tsx
    "build:swc": "NODE_ENV=development npx swc --out-dir dist -w src" // this will start build in watch mode
    ```
    
    ```tsx
    "start:swc": "NODE_ENV=development nodemon dist/main" // run in another tab concurrently with build:swc
    ```
    
- For ORM, we need to update as follows since `swc` does not handle circular dependencies well:
    
    ```tsx
    // src/reports/reports.entity.ts
    import { Relation } from "typeorm";
    
    ...
    
    @OneToMany(() => Report, (report) => report.user)
      reports: Relation<Report[]>;
    ```
    
    Note the `Relation` keyword. We apply a similar change for the users entity as well.
    
    <aside>
    💡 As of this writing, the Nest Team is working on integrating with Rspack which has swc under the hood.
    
    </aside>
