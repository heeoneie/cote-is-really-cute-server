import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Attendance } from './Attendance';
import { Rival } from './Rival';
import { Level } from './Level';
import bcrypt from 'bcryptjs';
import { IsEmail, Length } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'userId', type: 'int' })
  userId!: number;
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
  @Column({ name: 'password', type: 'varchar', length: 100, nullable: false })
  password!: string;
  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  @Column({ name: 'experience', type: 'int', nullable: false })
  experience!: number;

  @ManyToOne(() => Level, (level: Level) => level.users)
  @JoinColumn({ name: 'level' })
  level!: Level;
  @OneToMany(() => Attendance, (attendance: Attendance) => attendance.user)
  @JoinColumn({ name: 'attendance' })
  attendances!: Attendance[];
  @OneToMany(() => Rival, (rival: Rival) => rival.user)
  @JoinColumn({ name: 'rival' })
  rivals!: Rival[];
}
