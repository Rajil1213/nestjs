import fastifyCsrf from "@fastify/csrf-protection";
import secureSession from "@fastify/secure-session";
import { ConfigService } from "@nestjs/config";
import { NestFastifyApplication } from "@nestjs/platform-fastify";

export const setupMiddleware = async (app: NestFastifyApplication) => {
  const configService = app.get(ConfigService);

  await app.register(secureSession, {
    secret: configService.get<string>("SESSION_SECRET"),
    salt: configService.get<string>("SESSION_SALT"),
    logLevel: "debug",
    cookieName: "nest_project_session",
    cookie: {
      path: "/",
      httpOnly: true,
      sameSite: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  });

  await app.register(fastifyCsrf, { sessionPlugin: "@fastify/secure-session" });
};
