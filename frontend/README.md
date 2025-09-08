# Bookstore Frontend

A modern, responsive Next.js 14+ frontend application for a bookstore with advanced search, filtering, cart management, and checkout functionality.

## 🚀 Features

### 📚 **Home Page - Advanced Book Discovery**
- **Smart Search Bar**: Auto-suggestions for book titles, publishers, and classes
- **Comprehensive Filtering**: Filter by class, publisher, and price range
- **Collapsible Filter Panel**: Toggle-able advanced filter options
- **Real-time Search**: Instant filtering as you type
- **Advanced Sorting**: Sort by title, price, or publisher with ascending/descending order
- **Responsive Grid**: Adaptive book layout for all screen sizes

### 🛒 **Cart Management**
- **Persistent Storage**: Cart survives browser sessions using localStorage
- **Quantity Management**: Add, remove, and update item quantities
- **Visual Feedback**: Cart icon with item count badge
- **Multi-tab Sync**: Cart updates across browser tabs
- **Minimal Data Storage**: Only stores essential data (item ID, quantity)

### 💳 **Checkout Process**
- **Customer Information Form**: Name, organization, phone, email, address
- **Client-side Validation**: Real-time validation with user-friendly error messages
- **Order Summary**: Detailed breakdown of cart items and total
- **Form Persistence**: Form data preserved during navigation

### ✅ **Order Confirmation**
- **Order Details**: Complete order information display
- **Customer Information**: Shipping and contact details
- **Print Functionality**: Print order details
- **Navigation**: Easy return to shopping

### 🎨 **User Experience**
- **Mobile-First Design**: Optimized for all device sizes
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful error states and user feedback
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### 🔧 **Technical Excellence**
- **TypeScript**: Strict typing throughout the application
- **Modular Architecture**: Reusable components and utilities
- **State Management**: Zustand for lightweight, efficient state
- **Comprehensive Logging**: Detailed logging for debugging and analytics
- **API Ready**: Stub functions ready for backend integration

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (utility-first)
- **State Management**: Zustand
- **Icons**: Heroicons (SVG)
- **Font**: Inter (Google Fonts)
- **Development**: ESLint, PostCSS, Autoprefixer

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── globals.css         # Global styles and Tailwind
│   │   ├── layout.tsx          # Root layout component
│   │   ├── page.tsx            # Home page with search/filter
│   │   ├── checkout/           # Checkout page
│   │   └── confirmation/       # Order confirmation page
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components
│   │   │   ├── Button.tsx      # Reusable button component
│   │   │   ├── BookCard.tsx    # Individual book display
│   │   │   └── CartIcon.tsx    # Cart icon with badge
│   │   └── layout/             # Layout components
│   │       └── Header.tsx      # Application header
│   ├── hooks/                  # Custom React hooks
│   │   └── useCart.ts          # Cart state management
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # All interfaces and types
│   ├── utils/                  # Utility functions
│   │   ├── api.ts              # API stubs and helpers
│   │   └── logger.ts           # Logging utility
│   └── data/                   # Static data and helpers
│       └── books.ts            # Sample book data
├── public/                     # Static assets
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── next.config.js              # Next.js configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📖 Sample Data

The application includes 12 sample books across different genres:

### Book Classes
- **Fiction**: Classic and contemporary novels
- **Non-Fiction**: Educational and informative books
- **Academic**: Textbooks and scholarly works
- **Children's**: Books for young readers
- **Young Adult**: Teen and young adult literature

### Sample Books Include
- The Great Gatsby (Fiction)
- To Kill a Mockingbird (Fiction)
- The Art of War (Non-Fiction)
- Introduction to Computer Science (Academic)
- The Little Prince (Children's)
- The Hunger Games (Young Adult)
- And 6 more diverse titles...

## 🔍 Search & Filter Features

### Smart Search
- **Auto-suggestions**: Real-time suggestions as you type
- **Multi-field Search**: Search across titles, publishers, and classes
- **Fuzzy Matching**: Partial text matching for better results
- **Click-to-Select**: One-click suggestion selection

### Advanced Filtering
- **Class Filter**: Filter by book genre/class
- **Publisher Filter**: Filter by publishing company
- **Price Range**: Set minimum and maximum price
- **Combined Filters**: Use multiple filters simultaneously
- **Clear All**: One-click filter reset

### Sorting Options
- **Sort by**: Title, Price, or Publisher
- **Order**: Ascending or descending
- **Visual Indicators**: Clear sort direction indicators

## 🛒 Cart Features

### Persistent Storage
- **localStorage**: Cart survives browser restarts
- **Versioned Keys**: `bookstore-cart-v1.0` for future compatibility
- **Minimal Data**: Only stores essential information
- **Multi-tab Sync**: Updates across browser tabs

### Cart Operations
- **Add to Cart**: Add books with quantity selection
- **Remove from Cart**: Remove items completely
- **Update Quantity**: Change item quantities
- **Clear Cart**: Remove all items
- **Cart Status**: Check if item is in cart

### Visual Feedback
- **Cart Badge**: Item count indicator
- **Button States**: "Add to Cart" / "Remove from Cart"
- **Quantity Controls**: Increment/decrement buttons
- **Total Display**: Real-time price calculations

## 📝 Form Validation

### Checkout Form Fields
- **Name/Organization**: Required text input
- **Phone**: International phone number validation
- **Email**: Email format validation
- **Address**: Required textarea

### Validation Features
- **Real-time Validation**: Validate on blur events
- **Regex Patterns**: 
  - Phone: `^\+?(\d{1,3})?[-.\s]?(\(?\d{3}\)?[-.\s]?)?(\d[-.\s]?){6,15}\d$`
  - Email: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- **Error Messages**: User-friendly, constructive feedback
- **Required Fields**: Clear indication of mandatory fields

## 🔌 API Integration

### Current Implementation
- **API Stubs**: Placeholder functions for all endpoints
- **Type Safety**: Full TypeScript interfaces
- **Error Handling**: Graceful fallbacks
- **Logging**: Detailed API call logging

### Ready for Backend
- **Book API**: `getAllBooks`, `getBookById`, `searchBooks`
- **Order API**: `createOrder`, `getOrderById`, `getOrders`
- **User API**: `validateEmail`, `createUser`
- **Generic Request Helper**: `apiRequest` function

### API Response Types
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## 📊 Logging System

### Log Levels
- **Info**: General application events
- **Warn**: Potential issues
- **Error**: Error conditions
- **Debug**: Detailed debugging information

### Specialized Logging
- **Cart Actions**: Add, remove, update operations
- **Checkout Process**: Form submission and validation
- **Order Confirmation**: Order completion events
- **Search & Filter**: User interaction tracking

### Log Format
```typescript
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
}
```

## 🎨 Styling & Design

### Tailwind CSS
- **Utility-First**: Rapid development with utility classes
- **Custom Colors**: Primary color palette defined
- **Responsive Design**: Mobile-first breakpoints
- **Custom Components**: Reusable component classes

### Design System
- **Color Palette**: Primary blues, grays, and semantic colors
- **Typography**: Inter font family
- **Spacing**: Consistent spacing scale
- **Shadows**: Subtle elevation system
- **Transitions**: Smooth hover and focus states

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔒 Security Considerations

### Client-Side Security
- **No Sensitive Data**: Cart only stores item IDs and quantities
- **Input Validation**: Client-side validation for user experience
- **XSS Prevention**: Proper input sanitization
- **CSRF Protection**: Ready for backend CSRF tokens

### Data Privacy
- **localStorage Security**: No sensitive information stored
- **Session Management**: Stateless design
- **Error Handling**: No sensitive data in error messages

## 🧪 Testing Considerations

### Component Testing
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Visual Regression**: UI consistency testing

### E2E Testing
- **User Flows**: Complete checkout process
- **Cross-browser**: Multiple browser testing
- **Mobile Testing**: Touch device testing
- **Performance**: Load time and responsiveness

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API endpoint
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_VERSION`: Application version

### Deployment Platforms
- **Vercel**: Optimized for Next.js
- **Netlify**: Static site deployment
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment

## 🔮 Future Enhancements

### Planned Features
- **User Authentication**: Login/register system
- **Wishlist**: Save books for later
- **Reviews & Ratings**: User feedback system
- **Advanced Search**: Full-text search with filters
- **Book Recommendations**: AI-powered suggestions
- **Payment Integration**: Stripe/PayPal integration
- **Order Tracking**: Real-time order status
- **Email Notifications**: Order confirmations and updates

### Technical Improvements
- **Performance**: Image optimization and lazy loading
- **SEO**: Meta tags and structured data
- **PWA**: Progressive Web App features
- **Offline Support**: Service worker implementation
- **Analytics**: User behavior tracking
- **A/B Testing**: Feature experimentation

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow TypeScript and ESLint rules
2. **Component Design**: Create reusable, typed components
3. **Testing**: Write tests for new features
4. **Documentation**: Update README for new features
5. **Logging**: Add appropriate logging for new functionality

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README first
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Email**: Contact the development team

### Common Issues
- **TypeScript Errors**: Ensure all dependencies are installed
- **Styling Issues**: Check Tailwind CSS configuration
- **Build Errors**: Verify Node.js version compatibility
- **Runtime Errors**: Check browser console for details

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS** 