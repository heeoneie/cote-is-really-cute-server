import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Rival } from './Rival';

@Entity('levels')
export class Level {
  @PrimaryGeneratedColumn({ name: 'level', type: 'int' })
  level!: number;
  @Column({ name: 'requiredExperience', type: 'int', nullable: false })
  requiredExperience!: number;

  @OneToMany(() => User, (user: User) => user.level)
  users!: User[];

  @OneToMany(() => Rival, (rival: Rival) => rival.level)
  rivals!: Rival[];
}
