const express = require('express');
const { body, query, param } = require('express-validator');
const {
  getAllBooks,
  getBookById,
  searchBooks,
  getBooksByClass,
  getAvailableClasses
} = require('../controllers/bookController');

const router = express.Router();

// Validation middleware
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['title', 'price', 'publisher', 'createdAt']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number')
];

const validateSearch = [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const validateBookId = [
  param('id').isMongoId().withMessage('Invalid book ID format')
];

const validateClass = [
  param('class').notEmpty().withMessage('Class parameter is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['title', 'price', 'publisher', 'createdAt']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];

// Routes
// @route   GET /api/books
// @desc    Get all books with pagination and filtering
// @access  Public
router.get('/', validatePagination, getAllBooks);

// @route   GET /api/books/classes
// @desc    Get available book classes
// @access  Public
router.get('/classes', getAvailableClasses);

// @route   GET /api/books/search
// @desc    Search books by query
// @access  Public
router.get('/search', validateSearch, searchBooks);

// @route   GET /api/books/class/:class
// @desc    Get books by class/genre
// @access  Public
router.get('/class/:class', validateClass, getBooksByClass);

// @route   GET /api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', validateBookId, getBookById);

module.exports = router;
