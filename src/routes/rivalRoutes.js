const express = require('express');
const router = express.Router();
const User = require('../entity/User');
const Rival = require('../entity/Rival');

/**
 * @swagger
 * tags:
 *   name: Rival
 *   description: 라이벌 등록 및 관리 API
 */

/**
 * @swagger
 * /rival/register:
 *   post:
 *     summary: 라이벌 등록
 *     description: 사용자가 라이벌을 등록합니다.
 *     tags: [Rival]
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

    if (!user || !rival)
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });

    const userAlreadyHasRival = user.rivals.includes(rival._id);
    if (userAlreadyHasRival)
      return res.status(400).json({ message: '이미 등록된 라이벌입니다.' });

    user.rivals.push(rival._id);
    rival.rivals.push(user._id);

    await user.save();
    await rival.save();

    const newRival = new Rival({ userId: user._id, rivalId: rival._id });
    await newRival.save();

    res.status(200).json({ message: '라이벌 등록 성공!' });
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
 *     tags: [Rival]
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

    if (!user || !rival)
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });

    const userRivalIndex = user.rivals.indexOf(rival._id);
    const rivalUserIndex = rival.rivals.indexOf(user._id);

    if (userRivalIndex > -1) user.rivals.splice(userRivalIndex, 1);
    if (rivalUserIndex > -1) rival.rivals.splice(rivalUserIndex, 1);

    await user.save();
    await rival.save();
    await Rival.deleteOne({ userId: user._id, rivalId: rival._id });

    res
      .status(200)
      .json({ message: '라이벌 삭제 성공!', userRivals: user.rivals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 에러' });
  }
});

/**
 * @swagger
 * /rival/get-info?userEmail=${userEmail}:
 *   get:
 *     summary: 라이벌 정보 조회
 *     description: 주어진 이메일을 통해 유저의 레벨과 라이벌들의 닉네임 및 레벨 정보를 반환합니다.
 *     tags: [Rival]
 *     parameters:
 *       - name: userEmail
 *         in: query
 *         required: true
 *         description: 조회할 유저의 이메일
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 유저 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userLevel:
 *                   type: integer
 *                   description: 유저의 레벨
 *                 rivals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nickName:
 *                         type: string
 *                         description: 라이벌의 닉네임
 *                       level:
 *                         type: integer
 *                         description: 라이벌의 레벨
 *       400:
 *         description: 이메일이 입력되지 않았습니다.
 *       404:
 *         description: 해당 유저를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
router.get('/get-info', async (req, res) => {
  const { userEmail } = req.query;

  if (!userEmail)
    return res.status(400).json({ message: '이메일을 입력해주세요.' });

  try {
    const user = await User.findOne({ email: userEmail }).populate(
      'levelId',
      'level',
    );
    if (!user)
      return res.status(404).json({ message: '해당 유저를 찾을 수 없습니다.' });

    const rivalPromises = user.rivals.map(async (rivalId) => {
      const rivalUser = await User.findById(rivalId).populate(
        'levelId',
        'level',
      );
      return {
        nickName: rivalUser.nickName,
        level: rivalUser.levelId.level,
      };
    });

    const rivals = await Promise.all(rivalPromises);

    res.status(200).json({
      userLevel: user.levelId.level,
      rivals,
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error });
  }
});

module.exports = router;
