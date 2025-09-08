'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { logger } from '@/utils/logger';

interface CartIconProps {
  className?: string;
}

const CartIcon: React.FC<CartIconProps> = ({ className = '' }) => {
  const { totalItems } = useCart();

  const handleCartClick = () => {
    logger.info('Cart icon clicked', {
      totalItems,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Link 
      href="/checkout" 
      className={`relative inline-flex items-center justify-center p-2 text-gray-700 hover:text-primary-600 transition-colors ${className}`}
      onClick={handleCartClick}
    >
      {/* Shopping Cart Icon */}
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        />
      </svg>

      {/* Item Count Badge */}
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium z-10">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}

      {/* Screen reader text */}
      <span className="sr-only">
        Shopping cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
      </span>
    </Link>
  );
};

export default CartIcon; 