import { Serialize } from "src/interceptors/serialize.interceptor";

import { Session as secureSession } from "@fastify/secure-session";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Session,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { UserDto } from "./dtos/user.dto";
import { UsersService } from "./users.service";

@Controller("auth")
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post("signup")
  async createUser(
    @Body() body: CreateUserDto,
    @Session() session: secureSession,
  ) {
    const user = await this.authService.signup(body.email, body.password);
    session.set("userId", user.id);
    return user;
  }

  @Post("signin")
  async signInUser(
    @Body() body: CreateUserDto,
    @Session() session: secureSession,
  ) {
    const user = await this.authService.signin(body.email, body.password);
    session.set("userId", user.id);
    return user;
  }

  @Post("signout")
  signOut(@Session() session: secureSession) {
    session.delete();
  }

  @Get("whoami")
  whoAmI(@Session() session: secureSession) {
    const userId = session.get("userId");
    if (!userId) {
      throw new BadRequestException("session cookie missing or invalid");
    }
    return this.usersService.findOne(session.get("userId"));
  }

  @Get(":id")
  // the id coming from the params is a string
  findUser(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Get()
  findAllUsers(@Query("email") email: string) {
    return this.usersService.find(email);
  }

  @Delete(":id")
  removeUser(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  @Patch(":id")
  updateUser(@Param("id") id: string, @Body() updateUserDoc: UpdateUserDto) {
    return this.usersService.update(id, updateUserDoc);
  }
}
