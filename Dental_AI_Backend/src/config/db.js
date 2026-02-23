const {Pool} = require('pg');
require('dotenv').config();

//

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error connecting to database:', err.message);
    }
    console.log('Connection established successfully!');
    release();
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