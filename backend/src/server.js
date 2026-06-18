/**
 * server.js
 * Application entry point.
 * Connects to the database then starts listening.
 * Handles graceful shutdown on SIGTERM / SIGINT.
 */

require('dotenv').config();
const app               = require('./app');
const { testConnection } = require('./db/pool');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify database connection before accepting traffic
    await testConnection();

    const server = app.listen(PORT, () => {
      console.log(`\n🌤  Weather Dashboard API is running`);
      console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Port        : ${PORT}`);
      console.log(`   Health      : http://localhost:${PORT}/health\n`);
    });

    // ─── Graceful Shutdown ──────────────────────────────────────────────────
    const gracefulShutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });

      // Force shutdown if not done in 10s
      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    process.exit(1);
  }
};

startServer();
