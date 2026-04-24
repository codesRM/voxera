const app = require('./app');
const env = require('./config/env');
const db  = require('./config/db');

async function startServer() {
  try {
    // Test DB connection
    await db.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

    // Start server
    app.listen(env.port, () => {
      console.log(`🚀 Voxera API running on port ${env.port} [${env.nodeEnv}]`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();