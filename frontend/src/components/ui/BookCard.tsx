import React, { useState } from 'react';
import { Book } from '@/types';
import { useCart } from '@/hooks/useCart';
import Button from './Button';
import { logger } from '@/utils/logger';
import { toast } from 'react-toastify';

interface BookCardProps {
  book: Book;
  className?: string;
}

const BookCard: React.FC<BookCardProps> = ({ book, className = '' }) => {
  const { addToCart, removeFromCart, updateQuantity, isInCart, getCartItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const bookId = book._id || book.id;
  const isInCartState = bookId ? isInCart(bookId) : false;
  const cartItem = bookId ? getCartItem(bookId) : undefined;
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      addToCart(book, quantity);
      logger.info('Book added to cart from card', {
        bookId: bookId,
        bookTitle: book.title,
        quantity,
        price: book.price
      });
      
      // Show success toast
      toast.success(`📚 "${book.title}" added to cart!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      logger.error('Failed to add book to cart', {
        bookId: bookId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Show error toast
      toast.error('❌ Failed to add book to cart. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCart = () => {
    if (!bookId) return;
    removeFromCart(bookId);
    logger.info('Book removed from cart from card', {
      bookId: bookId,
      bookTitle: book.title
    });
    
    // Show info toast
    toast.info(`🗑️ "${book.title}" removed from cart`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (!bookId) return;
    updateQuantity(bookId, newQuantity);
    logger.info('Book quantity updated from card', {
      bookId: bookId,
      bookTitle: book.title,
      newQuantity
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Book Image */}
      <div className="relative h-64 bg-gray-200">
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop';
            logger.warn('Book image failed to load, using fallback', {
              bookId: book.id,
              originalSrc: book.image
            });
          }}
        />
        {book.class && (
          <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
            {book.class}
          </span>
        )}
      </div>

      {/* Book Information */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {book.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2">
          {book.publisher}
        </p>

        {book.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {book.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-gray-900">
            ₹{book.price.toFixed(2)}
          </span>
          
          {book.isbn && (
            <span className="text-xs text-gray-400">
              ISBN: {book.isbn}
            </span>
          )}
        </div>

        {/* Cart Controls */}
        <div className="space-y-3">
          {!isInCartState ? (
            <>
              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <label htmlFor={`quantity-${bookId}`} className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <div className="flex items-center border rounded-md">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    -
                  </button>
                  <input
                    id={`quantity-${bookId}`}
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-12 text-center border-0 focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                loading={isLoading}
                className="w-full"
                size="sm"
              >
                Add to Cart
              </Button>
            </>
          ) : (
            <>
              {/* Quantity in Cart */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  In cart: {currentQuantity}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(currentQuantity - 1)}
                    disabled={currentQuantity <= 1}
                    className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium">{currentQuantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(currentQuantity + 1)}
                    className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Remove from Cart Button */}
              <Button
                onClick={handleRemoveFromCart}
                variant="danger"
                className="w-full"
                size="sm"
              >
                Remove from Cart
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard; 