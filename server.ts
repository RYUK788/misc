
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = 3001; // Using a different port from the frontend

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'golgix',
  password: 'preciseV5',
  database: 'broan'
};

// API endpoint to get users
app.get('/api/users', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT `username` FROM `ab_user`');
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
