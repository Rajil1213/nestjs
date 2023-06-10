import * as request from "supertest";

import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";

import { AppModule } from "../src/app.module";
import { setupMiddleware } from "../src/setup-plugins";

describe("Authentication System", () => {
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

  afterEach(async () => {
    await app.close();
  });

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
});
