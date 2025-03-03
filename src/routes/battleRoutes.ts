import { Server, Socket } from 'socket.io';
import { fetchRandomProblem } from './openaiRoutes';
import { User } from '../entity/User';
import { levelRepository, userRepository } from '../repository/repository';

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
        if (isCorrect) {
          const match = Object.values(battles).find(
            (battle) =>
              battle.players.includes(userEmail) &&
              battle.problemNumber === problemNumber,
          );

          if (match) {
            try {
              const winner = await userRepository.findOne({
                where: { email: userEmail },
              });
              const loserEmail = match.players.find(
                (player) => player !== userEmail,
              );
              const loser = await userRepository.findOne({
                where: { email: loserEmail },
              });
              const winnerSocketId = Object.keys(users).find(
                (id) => users[id] === userEmail,
              );
              const loserSocketId = Object.keys(users).find(
                (id) => users[id] === loserEmail,
              );

              const experienceAwarded = 10;
              if (winner) {
                winner.experience += experienceAwarded;
                await userRepository.save(winner);

                await checkLevelUp(winner);

                const res = {
                  winner: winner.nickName,
                  loser: loser?.nickName,
                  problemId: problemNumber,
                  experience: experienceAwarded,
                };

                if (winnerSocketId)
                  io.to(winnerSocketId).emit('battleEnded', res);
                if (loserSocketId)
                  io.to(loserSocketId).emit('battleEnded', res);
              }
            } catch (error) {
              console.error('Error finding user:', error);
            }
          }
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
      delete users[socket.id];
    });
  });
};

async function checkLevelUp(user: User): Promise<void> {
  if (user.experience >= 100) {
    const currentLevel = user.level.level;
    const nextLevel = await levelRepository.findOne({
      where: { level: currentLevel + 1 },
    });
    if (nextLevel) user.level = nextLevel;
    else console.warn(`레벨 ${currentLevel + 1}이 존재하지 않습니다.`);
    user.experience = 0;
    await userRepository.save(user);
  }
}
