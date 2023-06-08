import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  UnprocessableEntityException,
  Query,
} from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UsersService } from "./users.service";

@Controller("auth")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("signup")
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body.email, body.password);
  }

  @Get(":id")
  // the id coming from the params is a string
  findUser(@Param("id") id: string) {
    const idAsNum = parseInt(id);
    if (Number.isNaN(idAsNum)) {
      throw new UnprocessableEntityException("param :id must be a number");
    }

    return this.usersService.findOne(idAsNum);
  }

  @Get()
  findAllUsers(@Query("email") email: string) {
    return this.usersService.find(email);
  }
}
