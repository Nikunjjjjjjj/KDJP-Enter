import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartState, CartItem, Book } from '@/types';
import { logger } from '@/utils/logger';

// Cart store interface
interface CartStore extends CartState {
  // Actions
  addToCart: (book: Book, quantity?: number) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItem: (bookId: string) => CartItem | undefined;
  isInCart: (bookId: string) => boolean;
  cleanupCart: () => void;
}

// Calculate cart totals
const calculateTotals = (items: CartItem[]): { totalItems: number; totalPrice: number } => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
  return { totalItems, totalPrice };
};

// Create cart store with Zustand
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      totalItems: 0,
      totalPrice: 0,

      // Clean up corrupted cart items on initialization
      cleanupCart: () => {
        const { items } = get();
        const validItems = items.filter(item => item.book && (item.book._id || item.book.id));
        if (validItems.length !== items.length) {
          const { totalItems, totalPrice } = calculateTotals(validItems);
          set({ items: validItems, totalItems, totalPrice });
          logger.info('Cleaned up corrupted cart items', {
            originalCount: items.length,
            validCount: validItems.length,
            removedCount: items.length - validItems.length
          });
        }
      },

      // Add item to cart
      addToCart: (book: Book, quantity: number = 1) => {
        const bookId = book._id || book.id;
        if (!bookId) {
          logger.error('Cannot add book to cart: no valid ID', { book });
          return;
        }

        const { items } = get();
        const existingItem = items.find(item => (item.book._id || item.book.id) === bookId);

        let newItems: CartItem[];

        if (existingItem) {
          // Update existing item quantity
          newItems = items.map(item =>
            (item.book._id || item.book.id) === bookId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          logger.logCartAction('update', bookId, existingItem.quantity + quantity);
        } else {
          // Add new item
          newItems = [...items, { book, quantity }];
          logger.logCartAction('add', bookId, quantity);
        }

        const { totalItems, totalPrice } = calculateTotals(newItems);

        set({ items: newItems, totalItems, totalPrice });
        
        logger.info('Item added to cart', {
          bookId: bookId,
          bookTitle: book.title,
          quantity,
          newTotalItems: totalItems,
          newTotalPrice: totalPrice
        });
      },

      // Remove item from cart
      removeFromCart: (bookId: string) => {
        const { items } = get();
        const itemToRemove = items.find(item => (item.book._id || item.book.id) === bookId);
        
        if (!itemToRemove) {
          logger.warn('Attempted to remove item not in cart', { bookId });
          return;
        }

        const newItems = items.filter(item => (item.book._id || item.book.id) !== bookId);
        const { totalItems, totalPrice } = calculateTotals(newItems);

        set({ items: newItems, totalItems, totalPrice });
        
        logger.logCartAction('remove', bookId, itemToRemove.quantity);
        logger.info('Item removed from cart', {
          bookId,
          bookTitle: itemToRemove.book.title,
          quantityRemoved: itemToRemove.quantity,
          newTotalItems: totalItems,
          newTotalPrice: totalPrice
        });
      },

      // Update item quantity
      updateQuantity: (bookId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(bookId);
          return;
        }

        const { items } = get();
        const newItems = items.map(item =>
          (item.book._id || item.book.id) === bookId
            ? { ...item, quantity }
            : item
        );

        const { totalItems, totalPrice } = calculateTotals(newItems);

        set({ items: newItems, totalItems, totalPrice });
        
        logger.logCartAction('update', bookId, quantity);
        logger.info('Cart item quantity updated', {
          bookId,
          newQuantity: quantity,
          newTotalItems: totalItems,
          newTotalPrice: totalPrice
        });
      },

      // Clear entire cart
      clearCart: () => {
        const { items } = get();
        const itemCount = items.length;
        const totalPrice = get().totalPrice;

        set({ items: [], totalItems: 0, totalPrice: 0 });
        
        logger.info('Cart cleared', {
          itemsRemoved: itemCount,
          totalPriceCleared: totalPrice
        });
      },

      // Get specific cart item
      getCartItem: (bookId: string) => {
        return get().items.find(item => {
          if (!item.book) return false;
          return (item.book._id || item.book.id) === bookId;
        });
      },

      // Check if item is in cart
      isInCart: (bookId: string) => {
        return get().items.some(item => {
          if (!item.book) return false;
          return (item.book._id || item.book.id) === bookId;
        });
      },
    }),
    {
      name: 'bookstore-cart-v1.1', // Updated version to clear old corrupted data
      storage: createJSONStorage(() => localStorage),
      // Only persist necessary data (not sensitive information)
      partialize: (state) => ({
        items: state.items.filter(item => item.book && (item.book._id || item.book.id)).map(item => ({
          book: item.book,
          quantity: item.quantity
        }))
      }),
      // Rehydrate cart with full book data
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Clean up any corrupted cart items after rehydration
          state.cleanupCart();
          logger.debug('Cart rehydrated from localStorage');
        }
      },
    }
  )
);

// Custom hook for cart operations with additional utilities
export const useCartOperations = () => {
  const cart = useCart();

  return {
    ...cart,
    // Additional utility functions
    getCartSummary: () => ({
      itemCount: cart.totalItems,
      totalPrice: cart.totalPrice,
      uniqueItems: cart.items.length
    }),
    
    // Check if cart is empty
    isEmpty: () => cart.items.length === 0,
    
    // Get formatted total price
    getFormattedTotal: () => `₹${cart.totalPrice.toFixed(2)}`,
    
    // Bulk operations
    addMultipleItems: (items: Array<{ book: Book; quantity: number }>) => {
      items.forEach(({ book, quantity }) => {
        cart.addToCart(book, quantity);
      });
    }
  };
}; 