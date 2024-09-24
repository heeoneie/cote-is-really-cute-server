const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/search', async (req, res) => {
    const { nickname } = req.query;

    if (!nickname) return res.status(400).json({ message: '검색할 닉네임을 입력해주세요.' });

    try {
        const users = await User.find(
            { nickname: { $regex: nickname, $options: 'i' } }
        ).select('-password -_id -__v -email');

        if (users.length === 0) return res.status(404).json({ message: '일치하는 사용자가 없습니다.' });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: '서버 오류', error });
    }
});

module.exports = router;
