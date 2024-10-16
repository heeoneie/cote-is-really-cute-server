import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nickName: string = '';

    @Column()
    email: string = '';

    @Column()
    password: string = '';

    @Column('simple-array')
    rivals: string[] = [];

    @Column()
    levelId: number = 0;

    @Column()
    experience: number = 0;

    @Column('simple-array')
    attendanceDates: string[] = [];
}
