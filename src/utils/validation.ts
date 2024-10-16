import { User } from '../entity/User';
import {Repository} from "typeorm";
import {AppDataSource} from "../config/db";

const userRepository: Repository<User> = AppDataSource.getRepository(User);

export const checkNickNameDuplicate = async (nickName: string): Promise<boolean> => {
    const existingUser = await userRepository.findOne({ where : { nickName } });
    return !!existingUser;
};

export const checkEmailDuplicate = async (email: string): Promise<boolean> => {
    const existingUser = await userRepository.findOne({ where: { email } });
    return !!existingUser;
};
