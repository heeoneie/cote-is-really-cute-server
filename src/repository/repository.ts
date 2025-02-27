import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { AppDataSource } from '../config/db';

export const userRepository: Repository<User> =
  AppDataSource.getRepository(User);
export const rivalRepository: Repository<Rival> =
  AppDataSource.getRepository(Rival);
