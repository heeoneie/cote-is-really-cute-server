const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @swagger
 * /users/search?nickname={nickname}:
 *   get:
 *     summary: 사용자 검색
 *     description: 닉네임을 사용하여 사용자를 검색합니다.
 *     tags: [User]
 *     parameters:
 *       - name: nickname
 *         in: query
 *         required: true
 *         description: 검색할 닉네임
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사용자 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nickname:
 *                     type: string
 *                   baekjoonTier:
 *                     type: string
 *       400:
 *         description: 검색할 닉네임이 입력되지 않았습니다.
 *       404:
 *         description: 일치하는 사용자가 없습니다.
 *       500:
 *         description: 서버 오류
 */

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
