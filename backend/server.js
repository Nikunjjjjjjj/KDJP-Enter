require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

// Import routes
const bookRoutes = require('./routes/bookRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration - Allow all origins for development and testing
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Request timing middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bookstore API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bookstore API',
    version: '1.0.0',
    endpoints: {
      books: {
        'GET /api/books': 'Get all books with pagination and filtering',
        'GET /api/books/:id': 'Get book by ID',
        'GET /api/books/search?q=:query': 'Search books',
        'GET /api/books/class/:class': 'Get books by class/genre',
        'GET /api/books/classes': 'Get available book classes'
      },
      orders: {
        'POST /api/orders': 'Create new order',
        'GET /api/orders/:id': 'Get order by ID',
        'GET /api/orders/customer/:email': 'Get orders by customer email'
      }
    },
    documentation: 'API documentation will be available here'
  });
});

// 404 handler - must be placed after all other routes
app.use((req, res) => {
  const responseTime = Date.now() - req.startTime;
  logger.logApiError(req.method, req.originalUrl, 404, new Error('Route not found'), req.get('User-Agent'));
  
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    meta: {
      responseTime: `${responseTime}ms`
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  const responseTime = Date.now() - req.startTime;
  
  logger.logApiError(req.method, req.originalUrl, 500, error, req.get('User-Agent'));
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Please check your input data',
      details: Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      })),
      meta: {
        responseTime: `${responseTime}ms`
      }
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID',
      message: 'Please provide a valid ID',
      meta: {
        responseTime: `${responseTime}ms`
      }
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate Entry',
      message: 'This record already exists',
      meta: {
        responseTime: `${responseTime}ms`
      }
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : error.message,
    meta: {
      responseTime: `${responseTime}ms`
    }
  });
});

// Response timing middleware - moved to end
app.use((req, res, next) => {
  const responseTime = Date.now() - req.startTime;
  logger.logApiRequest(req.method, req.originalUrl, res.statusCode, responseTime, req.get('User-Agent'));
  next();
});

// Start server
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection', {
    error: err.message,
    stack: err.stack,
    promise: promise
  });
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
