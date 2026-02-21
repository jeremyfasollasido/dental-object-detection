const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Database connected successfully to PostgreSQL');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error executing query:', err.message);
    } else {
        console.log('Database query result:', res.rows[0].now);
    }
});

module.exports = pool;