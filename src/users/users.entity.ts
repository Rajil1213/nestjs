import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
// okay to not append Entity to the name (community convention)
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;
}
