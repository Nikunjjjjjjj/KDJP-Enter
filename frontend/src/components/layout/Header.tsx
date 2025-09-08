import React from 'react';
import Link from 'next/link';
import CartIcon from '@/components/ui/CartIcon';
import { logger } from '@/utils/logger';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
            >
              <svg
                className="w-8 h-8 text-primary-600"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>BookStore</span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Books
              </Link>
              <Link 
                href="/checkout" 
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Checkout
              </Link>
            </nav>
          </div>

          {/* Cart Icon */}
          <div className="flex items-center space-x-4 relative z-20">
            <CartIcon />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-2 space-y-1">
          <Link 
            href="/" 
            className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
          >
            Books
          </Link>
          <Link 
            href="/checkout" 
            className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
          >
            Checkout
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 