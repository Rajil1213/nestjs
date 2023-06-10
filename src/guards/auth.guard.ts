import { Session } from "@fastify/secure-session";
import { CanActivate, ExecutionContext } from "@nestjs/common";

export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const userId = (request.session as Session).get("userId");

    return userId;
  }
}
