import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id;
  @Column({ name: 'attendanceDates', type: 'date' })
  attendanceDates;
}
