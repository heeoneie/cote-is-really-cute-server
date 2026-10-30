import { Server, Socket } from 'socket.io';
import { fetchRandomProblem } from './openaiRoutes';
import { User } from '../entity/User';
import { AppDataSource } from '../config/db';
import { EntityManager } from 'typeorm';
import { Level } from '../entity/Level';

interface Battle {
  players: string[];
  socketIds: string[];
  problemNumber: number;
  isMatched: boolean;
  isFinished: boolean;
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
          isFinished: false,
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

        const matchId = Object.keys(battles).find(
          (id) =>
            battles[id].players.includes(userEmail) &&
            battles[id].problemNumber === problemNumber,
        );

        if (!matchId) return;
        const match = battles[matchId];
        // 먼저 맞힌 한 명만 승자로 처리하고, 늦게 온 제출이 경험치를 또 받지 않게 막는다.
        if (match.isFinished) return;
        match.isFinished = true;

        try {
          const res = await AppDataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
              const winner = await transactionalEntityManager.findOne(User, {
                where: { email: userEmail },
                relations: ['level'],
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
              return {
                winner: winner.nickName,
                loser: loser?.nickName,
                problemId: problemNumber,
                experience: experienceAwarded,
              };
            },
          );

          // 커밋된 뒤에만 결과를 알린다.
          for (const socketId of match.socketIds)
            io.to(socketId).emit('battleEnded', res);
          delete battles[matchId];
        } catch (error) {
          match.isFinished = false;
          console.error('Error finishing battle:', error);
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
  if (!user.level) {
    console.warn(`사용자 ${user.email}에게 레벨이 없습니다.`);
    return;
  }
  if (user.experience >= user.level.requiredExperience) {
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
