require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

const port = process.env.PORT || 3000;
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/recommendation', recommendationRoutes);
app.use('/protected', protectedRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
