# DI Project

This project demostrates Dependency Injection (DI) in Nest across modules.

# Notes

## Introduction

#### Objective

- To understand modules and dependency injection

#### Structure

- Imitate a Computer
- Modules:
  - Computer Module
    - Computer Controller
      - run()
    - Depends on: CPU, Disk Modules
  - CPU Module
    - CPU Service
      - compute()
    - Depends on: Power Module
  - Disk Module
    - Disk Service
      - getData()
    - Depends on: Power Module
  - Power Module
    - Power Service
      - supplyPower

## Generate Files

- Modules
  ```tsx
  nest generate module computer
  nest g module cpu
  nest g module disk
  nest g module power
  ```
- Services
  ```tsx
  nest g service cpu
  nest g service disk
  nest g service power
  ```
- Controller
  ```tsx
  nest g controller computer
  ```

## Setup

- Remove `AppModule` and replace with the `ComputerModule` as the main module.
- Also setup fastify as before:

  ```tsx
  pnpm remove @nestjs/platform-express @types/express && pnpm add @nestjs/platform-fastify

  pnpm update
  ```

- Start with the Power Module as it is independent of other modules:

  ```tsx
  // src/power/power.service.ts
  import { Injectable } from "@nestjs/common";

  @Injectable()
  export class PowerService {
    supplyPower(watts: number) {
      console.log(`Supplying ${watts} watts of power`);
    }
  }
  ```

## Setting Up DI Between Modules

- The `CPU` and `Disk` modules depend on the `Power` module or rather an instance of the `Power` module.
- For this, we first need to **export** the Power service ⇒ tell the DI Container that it needs to be exported for use by other modules:

  ```tsx
  import { Module } from "@nestjs/common";
  import { PowerService } from "./power.service";

  @Module({
    providers: [PowerService],
    **exports: [PowerService],**
  })
  export class PowerModule {}
  ```

- The CPU Module now needs to import the exported services from the Power Module:

  ```tsx
  import { Module } from "@nestjs/common";
  import { CpuService } from "./cpu.service";
  import { PowerModule } from "src/power/power.module";

  @Module({
    providers: [CpuService],
    **imports: [PowerModule],**
  })
  export class CpuModule {}
  ```

  Note that we import the PowerModule and not the PowerService. Importing the Power Module makes all its exported Services available to the CPU Module. This can be used in the constructor for the CPU Service:

  ```tsx
  import { PowerService } from "./../power/power.service";
  import { Injectable } from "@nestjs/common";

  @Injectable()
  export class CpuService {
    constructor(private PowerService: PowerService) {}
  }
  ```

## More on DI Between Modules

- Define some dummy method to make use of the imported service:

  ```tsx
  import { Injectable } from "@nestjs/common";
  import { PowerService } from "src/power/power.service";

  @Injectable()
  export class DiskService {
    constructor(private powerService: PowerService) {}

    writeToDisk(content: string) {
      console.log(
        "Drawing 15 watts of power from Power Service to write to disk",
      );
      this.powerService.supplyPower(15);
      return content;
    }
  }
  ```

- Now, CPU and Disk services need to be exported for the CPU Controller and used:

  ```tsx
  @Module({
    providers: [DiskService],
    imports: [PowerModule],
    exports: [DiskService], // export
  })
  export class DiskModule {}
  ```

  ```tsx
  @Module({
    providers: [CpuService],
    imports: [PowerModule],
    exports: [CpuService], // export
  })
  export class CpuModule {}
  ```

  ```tsx
  @Module({
    controllers: [ComputerController],
    imports: [CpuModule, DiskModule], // import both
  })
  export class ComputerModule {}
  ```

  ```tsx
  @Controller("computer")
  export class ComputerController {
    constructor(
      // use the imported services
      private cpuService: CpuService,
      private diskService: DiskService,
    ) {}

    @Get()
    run() {
      const result = this.cpuService.compute(1, 5);
      const diskWriteResult = this.diskService.writeToDisk(`${result}`);

      return [result, diskWriteResult];
    }
  }
  ```

## Footnotes

- There is only ONE DI container across all modules
- However, each DI container is scoped so that cross-module access is restricted
- Using the `imports` and `exports` config allows the services to be access across these module scopes.
- The `exports` config tells the DI container to make the services available to other modules
- The `imports` config tells the DI container to fetch the services from the exported module so that it is available inside the module.
