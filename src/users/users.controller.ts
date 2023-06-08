import { Serialize } from "src/interceptors/serialize.interceptor";

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";

import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { UserDto } from "./dtos/user.dto";
import { UsersService } from "./users.service";

@Controller("auth")
@Serialize(UserDto)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("signup")
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body.email, body.password);
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
