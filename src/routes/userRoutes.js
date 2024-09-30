const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkNickNameDuplicate } = require("../utils/validation");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 유저 정보 수정 및 조회 관련 API
 */

/**
 * @swagger
 * /users/search?nickName={nickName}:
 *   get:
 *     summary: 사용자 검색
 *     description: 닉네임을 사용하여 사용자를 검색합니다.
 *     tags: [User]
 *     parameters:
 *       - name: nickName
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
 *                   nickName:
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
    const { nickName } = req.query;

    if (!nickName) return res.status(400).json({ message: '검색할 닉네임을 입력해주세요.' });

    try {
        const users = await User.find(
            { nickName: { $regex: nickName, $options: 'i' } }
        ).select('-password -_id -__v -email');

        if (users.length === 0) return res.status(404).json({ message: '일치하는 사용자가 없습니다.' });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: '서버 오류', error });
    }
});

/**
 * @swagger
 * /users/update-nickName:
 *   put:
 *     summary: 닉네임 변경
 *     description: 사용자 닉네임을 변경합니다.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newNickName:
 *                 type: string
 *                 description: 새 닉네임
 *                 example: 'new_nickname'
 *     responses:
 *       200:
 *         description: 닉네임 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "닉네임이 성공적으로 변경되었습니다."
 *       400:
 *         description: 이미 사용 중인 닉네임입니다.
 *       500:
 *         description: 서버 에러
 */
router.put('/update-nickName', authMiddleware, async (req, res) => {
    const { newNickName } = req.body;

    try {
        const isNickNameDuplicate = await checkNickNameDuplicate(newNickName);
        if (isNickNameDuplicate) return res.status(400).json({ msg: '이미 사용 중인 닉네임입니다.' });

        const user = await User.findById(req.user.id);
        user.nickName = newNickName;
        await user.save();

        res.status(200).json({ message: '닉네임이 성공적으로 변경되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 에러' });
    }
});

/**
 * @swagger
 * /users/update-password:
 *   put:
 *     summary: 비밀번호 변경
 *     description: 사용자 비밀번호를 변경합니다.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: 새 비밀번호
 *                 example: 'newPassword456!'
 *               confirmPassword:
 *                 type: string
 *                 description: 새 비밀번호 검증
 *                 example: 'newPassword456!'
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "비밀번호가 성공적으로 변경되었습니다."
 *       400:
 *         description: 새 비밀번호와 재설정한 비밀번호가 일치하지 않습니다.
 *       500:
 *         description: 서버 에러
 */
router.put('/update-password', authMiddleware, async (req, res) => {
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) return res.status(400).json({ message: '새 비밀번호와 재설정한 비밀번호가 일치하지 않습니다.' });

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 에러' });
    }
});

router.post('/attend', async (req, res) => {
    const { userEmail, attendanceDate } = req.body;
    try {
        const user = await User.findOne({ email: userEmail });

        if (!user) return res.status(404).json({ message: '해당 유저를 찾을 수 없습니다.' });

        if (!user.attendanceDates.includes(attendanceDate)) {
            user.attendanceDates.push(attendanceDate);
            await user.save();
        }
        res.status(200).json({ message: '출석 성공!' });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

module.exports = router;
