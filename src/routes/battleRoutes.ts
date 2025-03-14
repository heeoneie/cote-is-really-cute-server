import { Server, Socket } from 'socket.io';
import { fetchRandomProblem } from './openaiRoutes';
import { User } from '../entity/User';
import { levelRepository, userRepository } from '../repository/repository';
import { AppDataSource } from '../config/db';
import { EntityManager } from 'typeorm';
import { Level } from '../entity/Level';

interface Battle {
  players: string[];
  socketIds: string[];
  problemNumber: number;
  isMatched: boolean;
  startTime: number;
}

interface UserData {
  email: string;
  socketId: string;
}

let users: { [key: string]: string } = {};
let waitingQueue: UserData[] = [];
let battles: { [key: string]: Battle } = {};
let io: Server;

export const setupSocket = (server: any): void => {
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

  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinBattle', async (userEmail: string) => {
      console.log(
        `Join request received for: ${userEmail} with socketId: ${socket.id}`,
      );

      users[socket.id] = userEmail;

      if (waitingQueue.length > 0) {
        const opponent = waitingQueue.pop();
        if (!opponent) return;
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

    socket.on(
      'submitSolution',
      async (data: {
        problemNumber: number;
        userEmail: string;
        isCorrect: boolean;
      }) => {
        const { problemNumber, userEmail, isCorrect } = data;
        if (!isCorrect) return;

        const match = Object.values(battles).find(
          (battle) =>
            battle.players.includes(userEmail) &&
            battle.problemNumber === problemNumber,
        );

        if (!match) return;

        try {
          await AppDataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
              const winner = await transactionalEntityManager.findOne(User, {
                where: { email: userEmail },
              });
              const loserEmail = match.players.find(
                (player) => player !== userEmail,
              );
              const loser = loserEmail
                ? await transactionalEntityManager.findOne(User, {
                    where: { email: loserEmail },
                  })
                : null;

              if (!winner)
                throw new Error(`Winner user not found: ${userEmail}`);

              const experienceAwarded = 10;
              winner.experience += experienceAwarded;
              await transactionalEntityManager.save(winner);
              await checkLevelUp(winner, transactionalEntityManager);
              const res = {
                winner: winner.nickName,
                loser: loser?.nickName,
                problemId: problemNumber,
                experience: experienceAwarded,
              };
              const winnerSocketId = Object.keys(users).find(
                (id) => users[id] === userEmail,
              );
              const loserSocketId = Object.keys(users).find(
                (id) => users[id] === loserEmail,
              );
              if (winnerSocketId)
                io.to(winnerSocketId).emit('battleEnded', res);
              if (loserSocketId) io.to(loserSocketId).emit('battleEnded', res);
            },
          );
        } catch (error) {
          console.error('Error finding user:', error);
        }
      },
    );

    socket.on(
      'battleEnded',
      async ({ winnerEmail }: { winnerEmail: string }) => {
        console.log(`Battle ended! Winner: ${winnerEmail}`);
      },
    );

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      waitingQueue = waitingQueue.filter((user) => user.socketId !== socket.id);
      const ongoingBattleKey = Object.keys(battles).find((matchId) =>
        battles[matchId].socketIds.includes(socket.id),
      );

      if (ongoingBattleKey) {
        const battle = battles[ongoingBattleKey];
        const opponentSocketId = battle.socketIds.find(
          (id) => id !== socket.id,
        );

        if (opponentSocketId) {
          io.to(opponentSocketId).emit('opponentDisconnected', {
            message: 'Your opponent has disconnected.',
          });
        }

        delete battles[ongoingBattleKey];
        console.log(
          `Battle ${ongoingBattleKey} has been removed due to disconnection.`,
        );
      }

      delete users[socket.id];
    });
  });
};

async function checkLevelUp(
  user: User,
  transactionalEntityManager: EntityManager,
): Promise<void> {
  if (user.experience >= 100) {
    const currentLevel = user.level.level;
    const nextLevel = await transactionalEntityManager.findOne(Level, {
      where: { level: currentLevel + 1 },
    });
    if (nextLevel) {
      user.level = nextLevel;
      user.experience = 0;
      await transactionalEntityManager.save(user);
    } else console.warn(`레벨 ${currentLevel + 1}이 존재하지 않습니다.`);
  }
}
