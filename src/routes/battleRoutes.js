const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /battle/join:
 *   post:
 *     summary: 배틀 매칭 대기열에 참가
 *     description: 사용자를 배틀 대기열에 추가하고, 상대가 있으면 매칭합니다.
 *     tags:
 *       - Battle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userEmail:
 *                 type: string
 *                 description: 배틀에 참여하는 사용자의 이메일.
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: 배틀에 성공적으로 참여하거나 대기열에 추가됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isMatched:
 *                   type: boolean
 *                   description: 사용자가 상대와 매칭되었는지 여부.
 *                   example: false
 *                 matchId:
 *                   type: string
 *                   description: 매칭된 경우 매치 ID.
 *                   example: match_1695670000000
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 오류 메시지.
 *                   example: 서버에서 매칭 처리 중 오류가 발생했습니다.
 */

let waitingQueue = ['testUser'];
let battles=  {};

router.post('/join', (req, res) => {
    try {
        const userEmail = req.body.userEmail;
        console.log(userEmail)

        if (waitingQueue.length > 0) {
            const opponentId = waitingQueue.pop();
            const matchId = `match_${Date.now()}`;
            console.log(opponentId, matchId)
            battles[matchId] = {
                players: [userEmail, opponentId],
                isMatched: true,
                startTime: Date.now(),
            };
            console.log(battles, waitingQueue);
            res.json({ isMatched: true, matchId });
        } else {
            waitingQueue.push(userEmail);
            res.json({ isMatched: false });
        }
    } catch (error) {
        console.error('배틀 참여 중 오류가 발생했습니다:', error);
        res.status(500).json({ error: '서버에서 매칭 처리 중 오류가 발생했습니다.' });
    }
});

/**
 * @swagger
 * /battle/status/{matchId}:
 *   get:
 *     summary: 매칭 상태 확인
 *     description: 주어진 매치 ID에 대해 배틀 매칭이 완료되었는지 확인합니다.
 *     tags:
 *       - Battle
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: 매칭 상태를 확인할 매치 ID.
 *     responses:
 *       200:
 *         description: 매칭 상태 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isMatched:
 *                   type: boolean
 *                   description: 매칭이 성공적으로 완료되었는지 여부.
 *                   example: true
 *       404:
 *         description: 매칭 정보 없음
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 오류 메시지.
 *                   example: 매칭 상태 확인 중 오류가 발생했습니다.
 */

router.get('/status/:matchId', (req, res) => {
    try {
        const { matchId } = req.params;

        if (battles[matchId]) res.json({ isMatched: battles[matchId].isMatched });
        else res.status(404).json({ message: '매칭 정보를 찾을 수 없습니다.' });

    } catch (error) {
        console.error('매칭 상태 확인 중 오류가 발생했습니다:', error);
        res.status(500).json({ error: '매칭 상태 확인 중 오류가 발생했습니다.' });
    }

});

module.exports = router;
