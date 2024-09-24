const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    const { nickname, email, password, baekjoonTier } = req.body;

    try {
        const newUser = new User({ nickname, email, password, baekjoonTier });
        await newUser.save();

        res.status(201).json({ message: '성공적으로 회원가입이 완료되었습니다!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 에러' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: '이메일을 다시 입력해주세요.' });


        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: '비밀번호를 다시 입력해주세요.' });

        const payload = {
            id: user.id,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('서버 에러');
    }
});

module.exports = router;
