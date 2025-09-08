// Book-related types
export interface Book {
  _id?: string; // MongoDB ObjectId from backend
  id?: string; // Frontend ID (for backward compatibility)
  title: string;
  publisher: string;
  class?: string; // Optional class/genre
  price: number;
  image: string;
  description?: string;
  isbn?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Cart item type
export interface CartItem {
  book: Book;
  quantity: number;
}

// Cart state type
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Checkout form types
export interface CheckoutFormData {
  name: string;
  organization?: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
}

// Order item type (matches backend structure)
export interface OrderItem {
  book: string | { // MongoDB ObjectId or populated book object
    _id: string;
    title: string;
    publisher: string;
    image: string;
  };
  quantity: number;
  price: number;
  title: string;
  publisher: string;
  image: string;
}

// Order types (matches backend structure)
export interface Order {
  _id?: string; // MongoDB ObjectId
  orderId: string; // Backend-generated order ID
  id?: string; // Frontend ID (for backward compatibility)
  customer: CheckoutFormData;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: string;
  notes?: string;
  orderDate?: Date;
  createdAt?: string;
  updatedAt?: string;
}

// API response types (matches backend structure)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalBooks?: number;
    totalOrders?: number;
    totalResults?: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  meta?: {
    queryTime?: string;
    query?: string;
    class?: string;
    customerEmail?: string;
    orderId?: string;
    totalClasses?: number;
  };
}

// Form validation types
export interface FormErrors {
  [key: string]: string;
}

// Log levels for logging utility
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Log entry type
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
} 