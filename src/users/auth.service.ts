import * as bcrypt from "bcrypt";

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";

import { UsersService } from "./users.service";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // see if an email already exists
    const users = await this.usersService.find(email);
    if (users.length > 0) {
      throw new BadRequestException("email already in use");
    }

    const rounds = 10; // generate salt automatically from these many rounds
    const hashedPassword = await bcrypt.hash(password, rounds);

    return this.usersService.create(email, hashedPassword);
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException(`user with email: ${email} not found`);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("wrong email/password combination");
    }

    return user;
  }
}
