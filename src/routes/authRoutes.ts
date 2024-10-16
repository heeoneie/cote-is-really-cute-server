const express = require('express');
const router = express.Router();
const User = require('../entity/User');
const jwt = require('jsonwebtoken');
const { checkNickNameDuplicate } = require("../utils/validation");
const Level = require("../entity/Level");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 회원가입 및 로그인 관련 API
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: 회원가입
 *     description: 새로운 사용자를 등록합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickName:
 *                 type: string
 *                 description: 사용자의 닉네임
 *                 example: 'example_nickname'
 *               email:
 *                 type: string
 *                 description: 사용자의 이메일
 *                 example: 'user@example.com'
 *               password:
 *                 type: string
 *                 description: 사용자의 비밀번호
 *                 example: 'yourPassword123!'
 *               baekjoonTier:
 *                 type: number
 *                 description: 백준 티어 (선택 사항)
 *                 example: 10
 *     responses:
 *       201:
 *         description: 성공적으로 회원가입이 완료되었습니다!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "성공적으로 회원가입이 완료되었습니다!"
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버 에러"
 */
router.post('/signup', async (req, res) => {
    const { nickName, email, password, baekjoonTier } = req.body;
    try {
        const level1 = await Level.findOne({ level: 1 });
        if (!level1) return res.status(500).json({ message: '1레벨 정보가 없습니다.' });

        const newUser = new User({
            nickName,
            email,
            password,
            baekjoonTier,
            experience: 0,
            levelId: level1._id,
        });

        await newUser.save();

        res.status(201).json({ message: '성공적으로 회원가입이 완료되었습니다!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 에러' });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 로그인
 *     description: 사용자가 이메일과 비밀번호로 로그인합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 사용자의 이메일
 *                 example: 'user@example.com'
 *               password:
 *                 type: string
 *                 description: 사용자의 비밀번호
 *                 example: 'yourPassword123!'
 *     responses:
 *       200:
 *         description: 로그인 성공 및 JWT 토큰 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: 인증에 사용되는 JWT 토큰
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: 이메일 또는 비밀번호가 잘못됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "이메일을 다시 입력해주세요."
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버 에러"
 */
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

/**
 * @swagger
 * /auth/check?nickName=${nickName}:
 *   get:
 *     summary: 닉네임 중복 확인
 *     description: 입력한 닉네임이 중복인지 확인합니다.
 *     tags: [Auth]
 *     parameters:
 *       - name: nickName
 *         in: query
 *         required: true
 *         description: 중복 확인할 닉네임
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 닉네임 중복 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   example: true  # 또는 false
 *       400:
 *         description: 닉네임 입력 누락
 *       500:
 *         description: 서버 오류
 */
router.get('/check', async (req, res) => {
    const { nickName } = req.query;

    if (!nickName) return res.status(400).json({ message: '닉네임을 입력해주세요.' });

    try {
        const isDuplicate = await checkNickNameDuplicate(nickName);
        res.json({ available: !isDuplicate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 에러' });
    }
});

module.exports = router;
