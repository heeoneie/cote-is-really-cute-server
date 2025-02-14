import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('levels')
export class Level {
  @PrimaryGeneratedColumn({ name: 'level', type: 'int' })
  level;
  @Column({ name: 'requiredExperience', type: 'int' })
  requiredExperience;
}
