const express = require('express');
const router = express.Router();
const { Server } = require('socket.io');

let io;

const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('someEvent', (data) => {
            console.log(data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

let waitingQueue = [];
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
            io.emit('matchFound', { matchId, players: [userEmail, opponentId] });
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

module.exports = { router, setupSocket };
