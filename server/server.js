const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/database/database');
const cors = require('cors');
const userRoutes = require('./src/routers/userRoutes');
const goalRoutes = require('./src/routers/goalRoutes');
const completeRoutes = require('./src/routers/completeRoutes');
const path = require("path");

dotenv.config();

const PORT = process.env.PORT || 5050;

const corsOptions = {
  origin: [process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const app = express();

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ preflight with correct options

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/user', userRoutes);
app.use('/api/goal', goalRoutes);
app.use('/api/complete', completeRoutes);

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ message });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer();