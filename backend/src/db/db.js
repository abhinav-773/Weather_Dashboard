/**
 * db/db.js
 * Public database interface — re-exports the pg pool as `db`.
 * Provides the `db.query()` alias expected by the project spec.
 * Controllers should import from here for consistency.
 */

const { pool, testConnection } = require('./pool');

/**
 * Execute a parameterized SQL query.
 * @param {string} text  - SQL string with $1, $2, ... placeholders
 * @param {Array}  params - Parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Acquire a client from the pool for transactions.
 * IMPORTANT: Always release the client in a finally block.
 */
const getClient = () => pool.connect();

module.exports = { query, getClient, testConnection };
