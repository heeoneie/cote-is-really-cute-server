const express = require('express');
const router = express.Router();
const { Server } = require('socket.io');
const { fetchRandomProblem } = require('./openaiRoutes');
const User = require('../models/User');
const { checkLevelUp } = require('../utils/level');

let users = {};
let waitingQueue = [];
let battles = {};
let io;

const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://violent-lea-coteisreallycute-52210e1a.koyeb.app',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('joinBattle', async (userEmail) => {
      console.log(
        `Join request received for: ${userEmail} with socketId: ${socket.id}`,
      );

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

        io.to(socket.id).emit('matchFound', { matchId, problem });
        io.to(opponent.socketId).emit('matchFound', { matchId, problem });
      } else {
        waitingQueue.push({ email: userEmail, socketId: socket.id });
      }
    });

    socket.on('submitSolution', async (data) => {
      const { problemNumber, userEmail, isCorrect } = data;
      if (isCorrect) {
        const match = Object.values(battles).find(
          (battle) =>
            battle.players.includes(userEmail) &&
            battle.problemNumber === problemNumber,
        );
        if (match) {
          try {
            const winner = await User.findOne({ email: userEmail });
            const loserEmail = match.players.find(
              (player) => player !== userEmail,
            );
            const loser = await User.findOne({ email: loserEmail });
            const winnerSocketId = Object.keys(users).find(
              (id) => users[id] === userEmail,
            );
            const loserSocketId = Object.keys(users).find(
              (id) => users[id] === loserEmail,
            );

            const experienceAwarded = 10;
            winner.experience += experienceAwarded;
            await winner.save();

            await checkLevelUp(winner);

            const res = {
              winner: winner.nickName,
              loser: loser.nickName,
              problemId: problemNumber,
              experience: experienceAwarded,
            };
            io.to(winnerSocketId).emit('battleEnded', res);
            io.to(loserSocketId).emit('battleEnded', res);
          } catch (error) {
            console.error('Error finding user:', error);
          }
        }
      }
    });

    socket.on('battleEnded', async ({ winnerEmail }) => {
      console.log(`Battle ended! Winner: ${winnerEmail}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      waitingQueue = waitingQueue.filter((user) => user.socketId !== socket.id);
      delete users[socket.id];
    });
  });
};

module.exports = { router, setupSocket };
