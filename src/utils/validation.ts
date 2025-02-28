import { userRepository } from '../repository/repository';

export const checkNickNameDuplicate = async (nickName: string) => {
  try {
    const existingUser = await userRepository.findOne({ where: { nickName } });
    return !!existingUser;
  } catch (error) {
    console.error('닉네임 중복 확인 중 오류 발생:', error);
    throw new Error('닉네임 중복 확인에 실패했습니다.');
  }
};

export const checkEmailDuplicate = async (email: string) => {
  try {
    const existingUser = await userRepository.findOne({ where: { email } });
    return !!existingUser;
  } catch (error) {
    console.error('이메일 중복 확인 중 오류 발생:', error);
    throw new Error('이메일 중복 확인에 실패했습니다.');
  }
};
