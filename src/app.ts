import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
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

const port = process.env.PORT;
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
  server.close(() => {
    console.log('서버가 정상적으로 종료되었습니다');
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
startServer();
