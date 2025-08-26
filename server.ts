


import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();


app.use(cors());
app.use(express.json());


// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});



// Database connection configuration
// const dbConfig = {
//   host: 'devops.golgixai.com',
//   port: 1434,
//   user: 'root',
//   password: 'VuToFz3A9t#^*U',
//   database: 'neogen'
// };

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'golgix',
  password: 'preciseV5',
  database: 'broan'
};
// const dbConfig = {
//   host: '134.199.220.196',
//   port: 3306,
//   user: 'golgix',
//   password: 'preciseV5',
//   database: 'broan'
// };
// API endpoint to get users
app.get('/api/users', async (req, res) => {
  try {
    console.log("Connecting to DB...");
    const connection = await mysql.createConnection(dbConfig);
    console.log("DB Connected");

    const [rows] = await connection.execute('SELECT `username` FROM `ab_user`');
    // console.log("Query executed. Result:", rows);

    await connection.end();
    console.log("🔌 Connection closed");

    res.json(rows);
  } catch (error: any) {
    console.error('Database connection error:', error.message);
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

app.post('/api/lab-results', async (req, res) => {
  const { query, params } = req.body;

  let connection;
  try {
    console.log("Connecting to DB for insert...");
    connection = await mysql.createConnection(dbConfig);
    console.log("DB Connected for insert");

    const [result] = await connection.execute(query, params);
    console.log("Query executed. Result:", result);

    await connection.end();
    console.log("Connection closed for insert");

    res.json({ success: true, message: 'Data saved successfully.' });
  } catch (error: any) {
    console.error('Database insert error:', error.message);
    console.error(error);
    if (connection) {
      await connection.end();
    }
    res.status(500).json({ error: 'Failed to save data', details: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

