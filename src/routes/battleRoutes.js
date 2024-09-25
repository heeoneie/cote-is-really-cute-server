const express = require('express');
const router = express.Router();

let waitingQueue = ['testUser'];
let battles=  {};

router.post('/join', (req, res) => {
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
});

router.get('/status/:matchId', (req, res) => {
    const { matchId } = req.params;

    if (battles[matchId]) {
        res.json({ isMatched: battles[matchId].isMatched });
    } else {
        res.status(404).json({ message: '매칭 정보를 찾을 수 없습니다.' });
    }
});

module.exports = router;
