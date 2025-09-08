const express = require('express');
const { body, query, param } = require('express-validator');
const {
  createOrder,
  getOrderById,
  getOrdersByCustomer
} = require('../controllers/orderController');

const router = express.Router();

// Validation middleware for order creation
const validateCreateOrder = [
  // Customer validation
  body('customer.name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('customer.organization')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organization name cannot exceed 100 characters'),
  
  body('customer.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?(\d{1,3})?[-.\s]?(\(?\d{3}\)?[-.\s]?)?(\d[-.\s]?){6,15}\d$/)
    .withMessage('Please enter a valid phone number'),
  
  body('customer.email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('customer.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  
  // Items validation
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.bookId')
    .notEmpty()
    .withMessage('Book ID is required for each item')
    .isMongoId()
    .withMessage('Invalid book ID format'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  // Total price validation
  body('totalPrice')
    .isFloat({ min: 0.01 })
    .withMessage('Total price must be greater than zero'),
  
  // Optional notes
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Validation for pagination
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Validation for order ID
const validateOrderId = [
  param('id').notEmpty().withMessage('Order ID is required')
];

// Validation for customer email
const validateCustomerEmail = [
  param('email')
    .notEmpty()
    .withMessage('Customer email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  ...validatePagination
];

// Routes
// @route   POST /api/orders
// @desc    Create new order
// @access  Public
router.post('/', validateCreateOrder, createOrder);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Public
router.get('/:id', validateOrderId, getOrderById);

// @route   GET /api/orders/customer/:email
// @desc    Get orders by customer email
// @access  Public
//router.get('/customer/:email', validateCustomerEmail, getOrdersByCustomer);

module.exports = router;
