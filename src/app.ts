require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const setupSwagger = require('./swagger/swagger');
const http = require('http');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const { router: openaiRoutes } = require('./routes/openaiRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const userRoutes = require('./routes/userRoutes');
const rivalRoutes = require('./routes/rivalRoutes');
const { setupSocket, router: battleRoutes } = require("./routes/battleRoutes");
const { createInitialLevels }= require("./utils/level");
const { connection } = require("mongoose");

const app = express();
const server = http.createServer(app);

connectDB();

connection.once('open', async () => {
  console.log('MongoDB 연결 후 레벨 초기화 실행');
  await createInitialLevels();
});

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
