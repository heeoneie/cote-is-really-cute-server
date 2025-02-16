require('dotenv').config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import { setupSwagger } from './swagger/swagger';
import http from 'http';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import { openaiRoutes } from './routes/openaiRoutes';
import protectedRoutes from './routes/protectedRoutes';
import userRoutes from './routes/userRoutes';
import rivalRoutes from './routes/rivalRoutes';
import { setupSocket, battleRoutes } from './routes/battleRoutes';

const app = express();
const server = http.createServer(app);

connectDB();

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use('/', healthRoutes);
app.use('/auth', authRoutes);
app.use('/openai', openaiRoutes);
app.use('/protected', protectedRoutes);
app.use('/users', userRoutes);
app.use('/rival', rivalRoutes);
app.use('/battle', battleRoutes);

setupSocket(server);

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
