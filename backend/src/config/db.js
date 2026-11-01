const { Pool } = require('pg');
require('dotenv').config();

// Determine connection parameters
const connectionString = process.env.DATABASE_URL;

let poolConfig = {};

if (connectionString) {
  poolConfig = {
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Supabase SSL connections
    }
  };
} else {
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
}

// Pool tuning for production readiness
poolConfig.max = parseInt(process.env.DB_POOL_MAX || '10', 10);
poolConfig.idleTimeoutMillis = 30000;
poolConfig.connectionTimeoutMillis = 10000;

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  // Client connected
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

// Helper query function
const query = (text, params) => pool.query(text, params);

// Connection test helper
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as database');
    return {
      connected: true,
      time: res.rows[0].current_time,
      database: res.rows[0].database
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
