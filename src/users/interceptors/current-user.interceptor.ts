import { Observable } from "rxjs";

import { Session } from "@fastify/secure-session";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";

import { UsersService } from "../users.service";

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userId = (request.session as Session).get("userId");

    if (userId) {
      const user = await this.usersService.findOne(userId);
      request.currentUser = user || {};
    }

    return next.handle();
  }
}
