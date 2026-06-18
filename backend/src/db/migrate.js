/**
 * db/migrate.js
 * Database migration script.
 * Creates the search_history table and its indexes if they don't exist.
 * Run once on deployment: node src/db/migrate.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { pool } = require('./pool');

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS search_history (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    city_name   VARCHAR(255)  NOT NULL,
    country     VARCHAR(100),
    latitude    NUMERIC(10,6),
    longitude   NUMERIC(10,6),
    searched_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
  );
`;

const createIndexSearchedAt = `
  CREATE INDEX IF NOT EXISTS idx_search_date
  ON search_history(searched_at DESC);
`;

const createIndexCityName = `
  CREATE INDEX IF NOT EXISTS idx_city_name
  ON search_history(city_name);
`;

const runMigrations = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('[Migration] Running database migrations...');

    await client.query(createTableSQL);
    console.log('[Migration] ✓ Table `search_history` ready.');

    await client.query(createIndexSearchedAt);
    console.log('[Migration] ✓ Index `idx_search_date` ready.');

    await client.query(createIndexCityName);
    console.log('[Migration] ✓ Index `idx_city_name` ready.');

    console.log('[Migration] All migrations completed successfully.');
  } catch (error) {
    console.error('[Migration] Migration failed:', error.message);
    throw error;
  } finally {
    if (client) client.release();
    await pool.end();
  }
};

runMigrations().catch(() => process.exit(1));
