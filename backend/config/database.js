const mongoose = require('mongoose');
const logger = require('../utils/logger');
require('dotenv').config();
// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Get MongoDB URI from environment variables
const getMongoUri = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    return process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
  }
  
  return process.env.MONGODB_URI;
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = getMongoUri();
    
    logger.info('Connecting to MongoDB', {
      uri: mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials in logs
      environment: process.env.NODE_ENV || 'development'
    });

    const startTime = Date.now();
    
    await mongoose.connect(mongoUri, mongoOptions);
    
    const connectionTime = Date.now() - startTime;
    
    logger.info('MongoDB connected successfully', {
      connectionTime: `${connectionTime}ms`,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port
    });

    // Log database connection events
    mongoose.connection.on('error', (error) => {
      logger.logDbError('connection', 'database', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, closing MongoDB connection');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, closing MongoDB connection');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      process.exit(0);
    });

  } catch (error) {
    logger.logDbError('connection', 'database', error);
    process.exit(1);
  }
};

// Disconnect from MongoDB
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.logDbError('disconnection', 'database', error);
  }
};

// Get database connection status
const getConnectionStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    database: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port
  };
};

// Health check for database
const healthCheck = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'error',
        message: 'Database not connected',
        readyState: mongoose.connection.readyState
      };
    }

    // Test the connection with a simple query
    await mongoose.connection.db.admin().ping();
    
    return {
      status: 'healthy',
      message: 'Database connection is healthy',
      database: mongoose.connection.name,
      uptime: process.uptime()
    };
  } catch (error) {
    logger.logDbError('health_check', 'database', error);
    return {
      status: 'error',
      message: 'Database health check failed',
      error: error.message
    };
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  healthCheck,
  mongoose
};
