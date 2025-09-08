# Frontend-Backend Integration Setup

## Environment Configuration

Create a `.env.local` file in the frontend directory with the following content:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Environment
NODE_ENV=development
```

## Backend Setup

1. Make sure your backend server is running on port 3001
2. Ensure MongoDB is connected and the database is seeded with books
3. Run the seed script if needed: `cd backend && node scripts/seedData.js`

## Frontend Setup

1. Install dependencies: `npm install`
2. Create the environment file as shown above
3. Start the development server: `npm run dev`

## API Integration

The frontend is now connected to your backend APIs:

### Books API
- `GET /api/books` - Get all books with filtering and pagination
- `GET /api/books/search` - Search books by query
- `GET /api/books/class/:class` - Get books by class/genre
- `GET /api/books/classes` - Get available book classes
- `GET /api/books/:id` - Get book by ID

### Orders API
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/customer/:email` - Get orders by customer email

## Features

- ✅ Real-time book search and filtering
- ✅ Cart management with backend integration
- ✅ Order creation with validation
- ✅ Error handling and loading states
- ✅ Responsive design with Tailwind CSS

## Testing

1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Browse books, add to cart, and complete checkout
4. Test search and filter functionality
