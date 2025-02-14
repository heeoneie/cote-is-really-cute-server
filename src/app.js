require('dotenv').config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import setupSwagger from './swagger/swagger.js';
import http from 'http';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { openaiRoutes } from './routes/openaiRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';
import userRoutes from './routes/userRoutes.js';
import rivalRoutes from './routes/rivalRoutes.js';
import { setupSocket, battleRoutes } from './routes/battleRoutes.js';

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
