/**
 * db/pool.js
 * PostgreSQL connection pool using the `pg` library.
 * Connection is configured via DATABASE_URL from environment variables.
 * Supports Neon serverless Postgres (SSL required).
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false } // Neon / Render requires SSL
      : false,
  max: 10,              // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log successful connection on startup
pool.on('connect', () => {
  console.log('[DB] New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

/**
 * Verify the database connection is alive.
 * Called during server startup.
 */
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW() AS current_time');
    console.log(
      `[DB] PostgreSQL connected successfully. Server time: ${result.rows[0].current_time}`
    );
  } catch (error) {
    console.error('[DB] Failed to connect to PostgreSQL:', error.message);
    throw error;
  } finally {
    if (client) client.release();
  }
};

module.exports = { pool, testConnection };
