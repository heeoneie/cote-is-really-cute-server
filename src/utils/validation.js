const User = require('../models/User');

const checkNickNameDuplicate = async (nickName) => {
    const existingUser = await User.findOne({ nickName });
    return !!existingUser; // 중복된 사용자가 있으면 true 반환
};

const checkEmailDuplicate = async (email) => {
    const existingUser = await User.findOne({ email });
    return !!existingUser; // 중복된 사용자가 있으면 true 반환
};

module.exports = { checkNickNameDuplicate, checkEmailDuplicate };
