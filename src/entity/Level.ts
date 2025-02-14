import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

@Entity('levels')
export class Level {
  @PrimaryGeneratedColumn({ name: 'level', type: 'int' })
  level: number;
  @Column({ name: 'requiredExperience', type: 'int', nullable: false })
  requiredExperience: number;

  @ManyToOne(() => User, (user: User) => user.level)
  @JoinColumn({ name: 'userId' })
  user: User;
}
