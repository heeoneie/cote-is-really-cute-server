import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Attendance } from './Attendance';
import { Rival } from './Rival';
import { Level } from './Level';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'userId', type: 'int' })
  userId: number;
  @Column({ name: 'email', type: 'varchar', nullable: false, unique: true })
  email: string;
  @Column({ name: 'nickname', type: 'varchar', nullable: false, unique: true })
  nickname: string;
  @Column({ name: 'password', type: 'varchar', nullable: false })
  password: string;
  @Column({ name: 'experience', type: 'int', nullable: false })
  experience: number;

  @OneToMany(() => Level, (level: Level) => level.user)
  level: Level;
  @OneToMany(() => Attendance, (attendance: Attendance) => attendance.user)
  attendances: Attendance[];
  @OneToMany(() => Rival, (rival: Rival) => rival.user)
  rivals: Rival[];
}
