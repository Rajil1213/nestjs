import { User } from "../users/users.entity";

declare module "fastify" {
  interface FastifyRequest {
    currentUser: User | Record<string, never>; // empty object
  }
}
