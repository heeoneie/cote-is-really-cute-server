require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const openaiRoutes = require('./routes/openaiRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const userRoutes = require('./routes/userRoutes');


const port = process.env.PORT || 3000;
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/', healthRoutes);
app.use('/auth', authRoutes);
app.use('/openai', openaiRoutes);
app.use('/protected', protectedRoutes);
app.use('/users', userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
