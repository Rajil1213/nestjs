import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Exclude } from "class-transformer";

@Entity()
// okay to not append Entity to the name (community convention)
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @AfterInsert()
  logInsert() {
    console.log(`Inserted user with id: ${this.id}`);
  }

  @AfterUpdate()
  logUpdate() {
    console.log(`Updated user with id: ${this.id}`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`Removed user with id: ${this.id}`);
  }
}
