const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
    const { userEmail, rivalNickName } = req.body;

    try {
        const user = await User.findOne({ email: userEmail });
        const rival = await User.findOne({ nickname: rivalNickName });

        if (!user || !rival) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }

        if (!user.rivals.includes(rival.email)) {
            user.rivals.push(rival.email);
            await user.save();
        }

        res.status(200).json({ message: '라이벌 등록 성공!', rivals: user.rivals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 에러' });
    }
});

module.exports = router;
