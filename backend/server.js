require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Import routes
const standsRoutes = require('./routes/stands');
const bookingsRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');

app.use('/api/stands', standsRoutes(pool));
app.use('/api/bookings', bookingsRoutes(pool));
app.use('/api/auth', authRoutes(pool));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { pool };
