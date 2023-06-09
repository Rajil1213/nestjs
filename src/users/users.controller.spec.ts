import { Session } from "@fastify/secure-session";
import { Test, TestingModule } from "@nestjs/testing";

import { AuthService } from "./auth.service";
import { UsersController } from "./users.controller";
import { User } from "./users.entity";
import { UsersService } from "./users.service";

describe("UsersController", () => {
  let controller: UsersController;
  let mockUsersService: Partial<UsersService>;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
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

    mockAuthService = {
      signin(email: string, password: string) {
        return Promise.resolve({
          id: 1,
          email,
          password,
        } as unknown as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("findAllUsers returns a list of users with the given email", async () => {
    const users = await controller.findAllUsers("test@test.com");
    expect(users.length).toBe(1);
  });

  it("findUser returns a single user with the given id", async () => {
    const user = await controller.findUser("1");
    expect(user).toBeDefined();
    expect(user).toMatchObject({
      id: "1",
    });
  });

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
    expect(mockStore["userId"]).toBe(1);
  });
});
