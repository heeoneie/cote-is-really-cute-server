import { userRepository } from '../repository/repository';

export const checkNickNameDuplicate = async (nickName: string) => {
  const existingUser = await userRepository.findOne({ where: { nickName } });
  return !!existingUser;
};

export const checkEmailDuplicate = async (email: string) => {
  const existingUser = await userRepository.findOne({ where: { email } });
  return !!existingUser;
};
