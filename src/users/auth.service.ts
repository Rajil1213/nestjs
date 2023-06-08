import * as bcrypt from "bcrypt";

import {
  BadRequestException,
  Injectable,
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
}
