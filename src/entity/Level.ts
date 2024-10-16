import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Level {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    level: number = 1;

    @Column()
    requiredExperience: number = 0;
}
