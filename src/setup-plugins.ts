import fastifyCsrf from "@fastify/csrf-protection";
import secureSession from "@fastify/secure-session";
import { NestFastifyApplication } from "@nestjs/platform-fastify";

export const setupMiddleware = async (app: NestFastifyApplication) => {
  await app.register(secureSession, {
    secret: "averylogphrasebiggerthanthirtytwochars",
    salt: "mq9hDxBVDbspDR6n",
    logLevel: "debug",
    cookieName: "nest_project_session",
    cookie: {
      httpOnly: true,
      sameSite: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  });

  await app.register(fastifyCsrf, { sessionPlugin: "@fastify/secure-session" });
};
