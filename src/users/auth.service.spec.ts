import * as bcrypt from "bcrypt";

import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { AuthService } from "./auth.service";
import { User } from "./users.entity";
import { UsersService } from "./users.service";

describe("AuthService", () => {
  let service: AuthService;
  let mockUsersService: Partial<UsersService>;

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

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("creates a hashed and salted password", async () => {
    const email = "test@test.com";
    const password = "password";
    const user = await service.signup(email, password);

    expect(user.password).not.toEqual(password);
    expect(bcrypt.compareSync(password, user.password)).toBeTruthy();
    expect(bcrypt.compareSync("some random value", user.password)).toBeFalsy();
  });

  it("throws a BadRequestException if the user signs in with an email that is in use", async () => {
    // create an email that is in use
    const email = "existingmail@test.com";
    const password = "password";

    await service.signup(email, password);

    // duplicate sign up
    await expect(service.signup(email, password)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("throws a NotFoundException if a sign in is attempted with a non-existing email", async () => {
    const email = "nonexistingemail@test.com";
    const password = "password";

    await expect(service.signin(email, password)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("throws an UnauthorizedException if a wrong password is provided", async () => {
    const email = "test@test.com";
    const password = "actualPassword";

    await service.signup(email, password);

    await expect(service.signin(email, "wrongPassword")).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("retuns a user if the signin password is correct", async () => {
    const email = "test@test.com";
    const password = "actualPassword";

    await service.signup(email, password);

    await expect(service.signin(email, password)).resolves.toMatchObject({
      email,
    });
  });
});
