const express = require('express');
const router = express.Router();
const { Server } = require('socket.io');
const { fetchRandomProblem } = require("./openaiRoutes");
const User = require('../models/User');

let users = {};
let waitingQueue = [];
let battles=  {};
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
        socket.on('joinBattle', async (userEmail) => {
            console.log(`Join request received for: ${userEmail} with socketId: ${socket.id}`);

            users[socket.id] = userEmail;

            if (waitingQueue.length > 0) {
                const opponent = waitingQueue.pop();
                const matchId = `match_${Date.now()}`;
                const problem = await fetchRandomProblem();

                battles[matchId] = {
                    players: [userEmail, opponent.email],
                    socketIds: [socket.id, opponent.socketId],
                    problemNumber: problem.problemNumber,
                    isMatched: true,
                    startTime: Date.now(),
                };
                // 매칭된 두 유저에게 문제 전달
                io.to(socket.id).emit('matchFound', { matchId, problem });
                io.to(opponent.socketId).emit('matchFound', { matchId, problem });

                console.log('Players matched:', [userEmail, opponent.email]);
            } else {
                // 대기열에 유저 추가
                waitingQueue.push({ email: userEmail, socketId: socket.id });
                console.log(`User ${userEmail} added to the waiting queue`);
            }
        });

        socket.on('submitSolution', async (data) => {
            const { problemNumber, userEmail, isCorrect } = data;
            console.log(data);
            if (isCorrect) {
                const match = Object.values(battles).find(battle =>
                    battle.players.includes(userEmail) && battle.problemNumber === problemNumber
                );
                if (match) {
                    try {
                        const winner = await User.findOne({ email: userEmail });
                        const loserEmail = match.players.find(player => player !== userEmail);
                        const loser = await User.findOne({ email: loserEmail });

                        const winnerSocketId = Object.keys(users).find(id => users[id] === userEmail);
                        const loserSocketId = Object.keys(users).find(id => users[id] === loserEmail);

                        const res = {
                            winner: winner.nickName,
                            loser: loser.nickName,
                            problemId: problemNumber
                        }
                        console.log(`Battle ended! Winner: ${winner.nickName}, Loser: ${loser.nickName}`);
                        io.to(winnerSocketId).emit('battleEnded', res);
                        io.to(loserSocketId).emit('battleEnded', res);
                    } catch (error) { console.error('Error finding user:', error); }
                }
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            waitingQueue = waitingQueue.filter(user => user.socketId !== socket.id);
            delete users[socket.id];
        });
    });
};

module.exports = { router, setupSocket };
