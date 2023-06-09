import { FastifyRequest } from "fastify";
import { Observable } from "rxjs";

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";

import { User } from "../users.entity";
import { UsersService } from "../users.service";

declare module "fastify" {
  interface FastifyRequest {
    currentUser: User | Record<string, never>;
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
