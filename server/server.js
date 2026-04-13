const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/database/database');
const cors = require('cors');
const userRoutes=require('./src/routers/userRoutes');
const goalRoutes=require('./src/routers/goalRoutes');

const PORT = process.env.PORT || 5050;

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',   // ← Change this
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/user', userRoutes);
app.use('/api/goal', goalRoutes);


// Error handler (must be after routes)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ message });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});