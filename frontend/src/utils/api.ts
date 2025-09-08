import { Book, Order, CheckoutFormData, ApiResponse } from '@/types';
import { logger } from './logger';

// API base URL - will be replaced with actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kdjp-enter.onrender.com/api';
//console.log('API_BASE_URL', API_BASE_URL);

// Generic API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error(`API request failed for ${endpoint}`, { 
        status: response.status, 
        error: data.error || data.message 
      });
      return { 
        success: false, 
        error: data.error || data.message || `HTTP error! status: ${response.status}` 
      };
    }

    return { success: true, data: data.data || data };
  } catch (error) {
    logger.error(`API request failed for ${endpoint}`, { error: error instanceof Error ? error.message : String(error) });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

// Book-related API functions
export const bookApi = {
  // Get all books with optional filters
  async getAllBooks(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    minPrice?: number;
    maxPrice?: number;
    publisher?: string;
    class?: string;
  }): Promise<ApiResponse<Book[]>> {
    logger.debug('Fetching all books from API', { params });
    
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<Book[]>(endpoint);
  },

  // Get book by ID
  async getBookById(id: string): Promise<ApiResponse<Book>> {
    logger.debug(`Fetching book with ID: ${id}`);
    return apiRequest<Book>(`/books/${id}`);
  },

  // Search books
  async searchBooks(query: string, page?: number, limit?: number): Promise<ApiResponse<Book[]>> {
    logger.debug(`Searching books with query: ${query}`);
    
    const queryParams = new URLSearchParams({ q: query });
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    
    return apiRequest<Book[]>(`/books/search?${queryParams.toString()}`);
  },

  // Get books by class/genre
  async getBooksByClass(bookClass: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<ApiResponse<Book[]>> {
    logger.debug(`Fetching books by class: ${bookClass}`);
    
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/books/class/${encodeURIComponent(bookClass)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<Book[]>(endpoint);
  },

  // Get available book classes
  async getAvailableClasses(): Promise<ApiResponse<string[]>> {
    logger.debug('Fetching available book classes');
    return apiRequest<string[]>('/books/classes');
  }
};

// Order-related API functions
export const orderApi = {
  // Create new order
  async createOrder(orderData: {
    customer: CheckoutFormData;
    items: Array<{ bookId: string; quantity: number }>;
    totalPrice: number;
    notes?: string;
  }): Promise<ApiResponse<Order>> {
    logger.info('Creating new order', { 
      customerEmail: orderData.customer.email,
      itemCount: orderData.items.length,
      totalPrice: orderData.totalPrice 
    });
    
    return apiRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    logger.debug(`Fetching order with ID: ${orderId}`);
    return apiRequest<Order>(`/orders/${orderId}`);
  },

  // Get orders by customer email
  async getOrdersByCustomer(email: string, page?: number, limit?: number): Promise<ApiResponse<{ data: Order[]; pagination?: any }>> {
    logger.debug(`Fetching orders for customer: ${email}`);
    
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    
    const endpoint = `/orders/customer/${encodeURIComponent(email)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<{ data: Order[]; pagination?: any }>(endpoint);
  }
};

// User-related API functions (for future authentication)
export const userApi = {
  // Get user profile
  async getUserProfile(): Promise<ApiResponse<any>> {
    logger.debug('Fetching user profile');
    // TODO: Replace with actual API call when authentication is implemented
    // return apiRequest('/user/profile');
    
    // Stub implementation for now
    return { success: true, data: null };
  },

  // Update user profile
  async updateUserProfile(profileData: any): Promise<ApiResponse<any>> {
    logger.debug('Updating user profile');
    // TODO: Replace with actual API call when authentication is implemented
    // return apiRequest('/user/profile', {
    //   method: 'PUT',
    //   body: JSON.stringify(profileData),
    // });
    
    // Stub implementation for now
    return { success: true, data: null };
  }
};

// Export all API functions
export { apiRequest }; 