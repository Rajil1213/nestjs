import { CanActivate, ExecutionContext, Inject } from "@nestjs/common";

import { UsersService } from "../users/users.service";

export class CurrentUserGuard implements CanActivate {
  constructor(@Inject(UsersService) private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<true> {
    const request = context.switchToHttp().getRequest();

    const userId = request.session.get("userId");

    if (userId) {
      const user = await this.usersService.findOne(userId);
      request.currentUser = user || {};
    }

    // always return true, handle Auth via AuthGuard for specific routes
    return Promise.resolve(true);
  }
}
