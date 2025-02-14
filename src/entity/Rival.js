import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rivals')
export class Rival {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id;
  @Column({ name: 'email', type: 'varchar' })
  email;
  @Column({ name: 'nickName', type: 'varchar' })
  nickName;
}
