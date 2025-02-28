import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB, { AppDataSource } from './config/db';
import { setupSwagger } from './swagger/swagger';
import http from 'http';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import openaiRoutes from './routes/openaiRoutes';
import protectedRoutes from './routes/protectedRoutes';
import userRoutes from './routes/userRoutes';
import rivalRoutes from './routes/rivalRoutes';
import { setupSocket } from './routes/battleRoutes';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const server = http.createServer(app);

connectDB();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

setupSwagger(app);

app.use('/', healthRoutes);
app.use('/auth', authRoutes);
app.use('/openai', openaiRoutes);
app.use('/protected', protectedRoutes);
app.use('/users', userRoutes);
app.use('/rival', rivalRoutes);

setupSocket(server);

if (!process.env.PORT)
  console.warn(
    'PORT 환경 변수가 설정되지 않았습니다. 기본값 3000을 사용합니다.',
  );
const port = process.env.PORT || '3000';
const startServer = async () => {
  try {
    server.listen(port, () => {
      console.log(`서버가 포트 ${port}에서 실행 중입니다`);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

const shutdown = async () => {
  console.log('서버를 종료합니다...');
  server.close(async () => {
    try {
      await AppDataSource.destroy();
      console.log('데이터베이스 연결이 정상적으로 종료되었습니다');
    } catch (error) {
      console.error('데이터베이스 연결 종료 실패:', error);
    }
    console.log('서버가 정상적으로 종료되었습니다');
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
startServer();
