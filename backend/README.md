# Bookstore Backend API

A robust Node.js/Express backend API for a bookstore application with MongoDB integration, comprehensive logging, and full CRUD operations.

## Features

- ✅ **MongoDB Integration** with Mongoose ODM
- ✅ **Comprehensive Logging** with Winston
- ✅ **Input Validation** with Express Validator
- ✅ **Rate Limiting** and Security Headers
- ✅ **Error Handling** and Graceful Shutdown
- ✅ **API Documentation** and Health Checks
- ✅ **Stock Management** and Order Processing
- ✅ **Search Functionality** with Text Indexing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Logging**: Winston
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp config.env.example .env
   
   # Edit the .env file with your configuration
   nano .env
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bookstore
MONGODB_URI_PROD=mongodb://your-production-mongodb-uri

# JWT Configuration (for future authentication)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Endpoints

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all books with pagination and filtering |
| GET | `/api/books/:id` | Get book by ID |
| GET | `/api/books/search?q=:query` | Search books |
| GET | `/api/books/class/:class` | Get books by class/genre |
| GET | `/api/books/classes` | Get available book classes |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/:id` | Get order by ID |
| GET | `/api/orders/customer/:email` | Get orders by customer email |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api` | API documentation |

## API Examples

### Get All Books
```bash
curl -X GET "http://localhost:3001/api/books?page=1&limit=10&sort=title&order=asc"
```

### Search Books
```bash
curl -X GET "http://localhost:3001/api/books/search?q=gatsby&page=1&limit=5"
```

### Get Books by Class
```bash
curl -X GET "http://localhost:3001/api/books/class/Fiction?page=1&limit=10"
```

### Create Order
```bash
curl -X POST "http://localhost:3001/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-123-4567",
      "address": "123 Main St, Anytown, USA 12345"
    },
    "items": [
      {
        "bookId": "507f1f77bcf86cd799439011",
        "quantity": 2
      }
    ],
    "totalPrice": 25.98
  }'
```

### Get Order by ID
```bash
curl -X GET "http://localhost:3001/api/orders/ORD-1234567890-ABC123DEF"
```

## Database Models

### Book Model
```javascript
{
  title: String (required),
  publisher: String (required),
  class: String (optional),
  price: Number (required),
  image: String (required, URL),
  description: String (optional),
  isbn: String (optional, unique),
  stock: Number (default: 0),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  orderId: String (unique, auto-generated),
  customer: {
    name: String (required),
    organization: String (optional),
    phone: String (required),
    email: String (required),
    address: String (required)
  },
  items: [{
    book: ObjectId (ref: Book),
    quantity: Number (required),
    price: Number (required),
    title: String (required),
    publisher: String (required),
    image: String (required)
  }],
  totalPrice: Number (required),
  status: String (enum: pending, confirmed, shipped, delivered, cancelled),
  paymentStatus: String (enum: pending, paid, failed, refunded),
  shippingAddress: String (required),
  notes: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## Scripts

```bash
# Development
npm run dev          # Start development server with nodemon

# Production
npm start            # Start production server

# Database
npm run seed         # Seed database with sample data

# Testing
npm test             # Run tests (when implemented)
```

## Logging

The application uses Winston for comprehensive logging:

- **Console Logging**: In development mode
- **File Logging**: In production mode
- **Log Levels**: error, warn, info, debug
- **Log Files**: 
  - `logs/error.log` - Error level logs
  - `logs/combined.log` - All logs

### Log Categories
- **API Requests**: All incoming requests with timing
- **Database Operations**: Query logging and performance
- **Business Logic**: Book and order operations
- **Security Events**: Authentication and authorization
- **Performance**: Slow operations and bottlenecks

## Error Handling

The API includes comprehensive error handling:

- **Validation Errors**: 400 Bad Request
- **Not Found**: 404 Not Found
- **Duplicate Entries**: 409 Conflict
- **Server Errors**: 500 Internal Server Error
- **Rate Limiting**: 429 Too Many Requests

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Request sanitization
- **Error Sanitization**: Hide sensitive data in production

## Performance Features

- **Database Indexing**: Optimized queries
- **Pagination**: Efficient data retrieval
- **Caching**: Ready for Redis integration
- **Compression**: Response compression
- **Connection Pooling**: MongoDB connection optimization

## Development

### Project Structure
```
backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── bookController.js    # Book API logic
│   └── orderController.js   # Order API logic
├── models/
│   ├── Book.js             # Book schema
│   └── Order.js            # Order schema
├── routes/
│   ├── bookRoutes.js       # Book routes
│   └── orderRoutes.js      # Order routes
├── scripts/
│   └── seedData.js         # Database seeding
├── utils/
│   └── logger.js           # Logging utility
├── logs/                   # Log files
├── package.json
├── server.js               # Main server file
└── README.md
```

### Adding New Features

1. **Create Model**: Add schema in `models/`
2. **Create Controller**: Add business logic in `controllers/`
3. **Create Routes**: Add endpoints in `routes/`
4. **Add Validation**: Include validation middleware
5. **Update Documentation**: Update this README

## Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set secure JWT secret
- [ ] Configure CORS origins
- [ ] Set up logging directory
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (if applicable)
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api`
- Review the logs in the `logs/` directory
