import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { AppDataSource } from '../config/db';
import { Rival } from '../entity/Rival';
import { Attendance } from '../entity/Attendance';

export const userRepository: Repository<User> =
  AppDataSource.getRepository(User);
export const rivalRepository: Repository<Rival> =
  AppDataSource.getRepository(Rival);
export const attendanceRepository: Repository<Attendance> =
  AppDataSource.getRepository(Attendance);
