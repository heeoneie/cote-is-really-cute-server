const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @swagger
 * tags:
 *   name: Rivals
 *   description: 라이벌 등록 및 관리 API
 */

/**
 * @swagger
 * /rival/register:
 *   post:
 *     summary: 라이벌 등록
 *     description: 사용자가 라이벌을 등록합니다.
 *     tags: [Rivals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userEmail:
 *                 type: string
 *                 description: 등록하는 유저의 이메일
 *                 example: 'user@example.com'
 *               rivalNickName:
 *                 type: string
 *                 description: 등록할 라이벌의 닉네임
 *                 example: 'rivalNickname'
 *     responses:
 *       200:
 *         description: 라이벌 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: '라이벌 등록 성공!'
 *                 rivals:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 'rival@example.com'
 *       400:
 *         description: 이미 등록된 라이벌
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: '이미 등록된 라이벌입니다.'
 *       404:
 *         description: 유저를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: '유저를 찾을 수 없습니다.'
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: '서버 에러'
 */
router.post('/register', async (req, res) => {
    const { userEmail, rivalNickName } = req.body;

    try {
        const user = await User.findOne({ email: userEmail });
        const rival = await User.findOne({ nickName: rivalNickName });

        if (!user || !rival) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });

        const userAlreadyHasRival = user.rivals.includes(rival.email);
        const rivalAlreadyHasUser = rival.rivals.includes(user.email);

        if (userAlreadyHasRival && rivalAlreadyHasUser) return res.status(400).json({ message: '이미 등록된 라이벌입니다.' });

        if (!user.rivals.includes(rival.email)) {
            user.rivals.push(rival.email);
            await user.save();
        }

        if (!rival.rivals.includes(user.email)) {
            rival.rivals.push(user.email);
            await rival.save();
        }

        res.status(200).json({ message: '라이벌 등록 성공!', rivals: user.rivals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 에러' });
    }
});

/**
 * @swagger
 * /rival/remove?userEmail=${userEmail}&rivalNickname=${rivalNickname}:
 *   delete:
 *     summary: 라이벌 삭제
 *     description: 사용자의 라이벌 목록에서 라이벌을 삭제합니다.
 *     tags: [Rivals]
 *     parameters:
 *       - in: query
 *         name: userEmail
 *         schema:
 *           type: string
 *         required: true
 *         description: 삭제 요청을 하는 유저의 이메일
 *         example: 'user@example.com'
 *       - in: query
 *         name: rivalNickName
 *         schema:
 *           type: string
 *         required: true
 *         description: 삭제할 라이벌의 닉네임
 *         example: 'rivalNickname'
 *     responses:
 *       200:
 *         description: 라이벌 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: '라이벌 삭제 성공!'
 *                 userRivals:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 'rival@example.com'
 *       404:
 *         description: 유저를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: '유저를 찾을 수 없습니다.'
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: '서버 에러'
 */
router.delete('/remove', async (req, res) => {
    const { userEmail, rivalNickName } = req.query;

    try {
        const user = await User.findOne({ email: userEmail });
        const rival = await User.findOne({ nickName: rivalNickName });

        if (!user || !rival) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });

        const userRivalIndex = user.rivals.indexOf(rival.email);
        const rivalUserIndex = rival.rivals.indexOf(user.email);

        if (userRivalIndex > -1) user.rivals.splice(userRivalIndex, 1);
        if (rivalUserIndex > -1) rival.rivals.splice(rivalUserIndex, 1);

        await user.save();
        await rival.save();

        res.status(200).json({ message: '라이벌 삭제 성공!', userRivals: user.rivals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 에러' });
    }
});

module.exports = router;
