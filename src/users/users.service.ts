import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./users.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(email: string, password: string) {
    const user = this.repo.create({ email, password });

    return this.repo.save(user);
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`user with id: ${id} not found`);
    }

    return user;
  }

  async find(email: string) {
    const users = await this.repo.find({ where: { email } });
    if (users.length == 0) {
      throw new NotFoundException(`no user with email: ${email} exists`);
    }

    return users;
  }

  async update(id: number, updateDoc: Partial<User>) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with id: ${id} not found`);
    }

    // copy over props
    Object.assign(user, updateDoc);

    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (user) {
      return this.repo.remove(user);
    }

    // if the user does not exist, it's already removed
    // an alternative is to throw an error
    return Promise.resolve(new User());
  }
}
