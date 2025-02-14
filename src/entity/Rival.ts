import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

@Entity('rivals')
export class Rival {
  @PrimaryGeneratedColumn({ name: 'rivalId', type: 'int' })
  rivalId: number;
  @Column({ name: 'email', type: 'varchar', nullable: false, unique: true })
  email: string;
  @Column({ name: 'nickName', type: 'varchar', nullable: false, unique: true })
  nickName: string;

  @ManyToOne(() => User, (user: User) => user.rivals)
  @JoinColumn({ name: 'userId' })
  user: User;
}
