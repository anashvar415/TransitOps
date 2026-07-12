import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './utils/logger';
import prisma from './utils/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify connection to DB
    await prisma.$connect();
    logger.info('Database connection established successfully.');

    app.listen(PORT, () => {
      logger.info(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server due to database connection error:', error);
    process.exit(1);
  }
};

startServer();
