const User = require('../models/User');

const checkNickNameDuplicate = async (nickName) => {
    const existingUser = await User.findOne({ nickName });
    return !!existingUser;
};

const checkEmailDuplicate = async (email) => {
    const existingUser = await User.findOne({ email });
    return !!existingUser;
};

module.exports = { checkNickNameDuplicate, checkEmailDuplicate };
