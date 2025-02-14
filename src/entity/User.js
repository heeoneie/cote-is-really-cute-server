import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id;
  @Column({ name: 'email', type: 'varchar' })
  email;
  @Column({ name: 'nickname', type: 'varchar' })
  nickname;
  @Column({ name: 'password', type: 'varchar' })
  password;
  @Column({ name: 'experience', type: 'int' })
  experience;
}
