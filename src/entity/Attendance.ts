import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn({ name: 'attendanceId', type: 'int' })
  attendanceId!: number;
  @Column({ name: 'attendanceDates', type: 'date' })
  attendanceDates!: Date;

  @ManyToOne(() => User, (user) => user.attendances)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
