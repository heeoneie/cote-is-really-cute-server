require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const openaiRoutes = require('./routes/openaiRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const userRoutes = require('./routes/userRoutes');
const rivalRoutes = require('./routes/rivalRoutes');
const battleRoutes = require('./routes/battleRoutes');
const setupSwagger = require('./swagger/swagger');

const port = process.env.PORT;
const app = express();

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
