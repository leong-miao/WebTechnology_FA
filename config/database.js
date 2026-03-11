const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'qiu_ordering',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert to promises
const promisePool = pool.promise();

// Test connection
const testConnection = async () => {
    try {
        const [rows] = await promisePool.query('SELECT 1 + 1 AS result');
        console.log('✅ MySQL connected successfully!');
        return true;
    } catch (error) {
        console.error('❌ MySQL connection error:', error.message);
        return false;
    }
};

module.exports = {
    pool: promisePool,
    testConnection
};