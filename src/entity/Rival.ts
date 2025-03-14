import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { IsEmail, Length } from 'class-validator';
import { Level } from './Level';

@Entity('rivals')
export class Rival {
  @PrimaryGeneratedColumn({ name: 'rivalId', type: 'int' })
  rivalId!: number;
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  @IsEmail()
  email!: string;
  @Column({ name: 'nickName', type: 'varchar', nullable: false, unique: true })
  @Length(2, 30)
  nickName!: string;

  @ManyToOne(() => User, (user: User) => user.rivals)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Level, (level: Level) => level.rivals)
  level!: Level;
}
