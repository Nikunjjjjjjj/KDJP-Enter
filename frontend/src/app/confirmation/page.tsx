'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Order } from '@/types';
import { orderApi } from '@/utils/api';
import { logger } from '@/utils/logger';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setIsLoading(false);
        return;
      }

      try {
        logger.info('Fetching order confirmation details', { orderId });
        
        // TODO: Replace with actual API call when backend is ready
         const response = await orderApi.getOrderById(orderId);
        
        if (response.success && response.data) {
          setOrder(response.data);
          
          // Log successful order confirmation
          logger.logOrderConfirmation(orderId, response.data.customer.email);
          
          logger.info('Order confirmation page loaded successfully', {
            orderId,
            customerEmail: response.data.customer.email,
            totalPrice: response.data.totalPrice,
            itemCount: response.data.items.length
          });
        } else {
          throw new Error(response.error || 'Failed to fetch order details');
        }

      } catch (error) {
        logger.error('Failed to fetch order confirmation', {
          orderId,
          error: error instanceof Error ? error.message : String(error)
        });
        setError('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-6">{error || 'The order you are looking for could not be found.'}</p>
        <Link href="/">
          <Button variant="primary">Return to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="text-green-500 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-lg text-gray-600">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Information</h2>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Order ID:</span>
              <p className="text-lg font-mono text-gray-900">{order.orderId}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Order Date:</span>
              <p className="text-gray-900">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A'}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Total Amount:</span>
              <p className="text-2xl font-bold text-gray-900">₹{order.totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <p className="text-gray-900">{order.customer.name}</p>
            </div>
            
            {order.customer.organization && (
              <div>
                <span className="text-sm font-medium text-gray-500">Organization:</span>
                <p className="text-gray-900">{order.customer.organization}</p>
              </div>
            )}
            
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-gray-900">{order.customer.email}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Phone:</span>
              <p className="text-gray-900">{order.customer.phone}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Shipping Address:</span>
              <p className="text-gray-900">{order.customer.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
        
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <img
                src={item.image}
                alt={item.title}
                className="w-16 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.publisher}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                <p className="font-medium text-gray-900">
s                   ₹{(item.quantity * item.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-200 pt-4 mt-6">
          <div className="flex justify-between text-lg font-semibold text-gray-900">
            <span>Total</span>
            <span>₹{order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            You will receive an email confirmation shortly
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            We'll notify you when your order ships
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            Estimated delivery: 3-5 business days
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Link href="/">
          <Button variant="primary" size="lg">
            Continue Shopping
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            // Print order details
            window.print();
            logger.info('Order confirmation printed', { orderId });
          }}
        >
          Print Order Details
        </Button>
      </div>
    </div>
  );
} 