import 'dotenv/config';
import app from './app.js';
import { testConnection } from './config/database.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  logger.info('🚀 Initializing Omronics Industrial CMS Server...');

  // Test MariaDB Connection Pool
  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.warn('⚠️ Warning: MariaDB connection could not be established at startup. Server starting in degraded mode.');
  }

  app.listen(PORT, () => {
    logger.info(`✅ Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info(`🔗 Base API Endpoint: http://localhost:${PORT}/api/v1`);
  });
}

startServer();
