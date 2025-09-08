const Order = require('../models/Order');
const Book = require('../models/Book');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const { sendOrderNotificationToOwner, sendOrderConfirmationToCustomer } = require('../utils/mailer');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  const startTime = Date.now();

  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.logApiError('POST', req.originalUrl, 400, new Error('Validation failed'), req.get('User-Agent'));
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Please check your input data',
        details: errors.array()
      });
    }

    const { customer, items, totalPrice, notes } = req.body;

    logger.logApiRequest('POST', req.originalUrl, 201, 0, req.get('User-Agent'));
    logger.logOrderOperation('create', null, {
      customerEmail: customer.email,
      itemCount: items.length,
      totalPrice
    });

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order items',
        message: 'Order must contain at least one item'
      });
    }

    // Validate total price
    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid total price',
        message: 'Total price must be greater than zero'
      });
    }

    // Process order items and validate books
    const processedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const { bookId, quantity } = item;

      if (!bookId || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid item data',
          message: 'Each item must have a valid bookId and quantity'
        });
      }

      // Fetch book details
      logger.logDbQuery('findOne', 'books', { _id: bookId, isActive: true }, 0);
      const book = await Book.findById(bookId).lean();

      if (!book) {
        logger.logBookOperation('fetch_not_found', bookId);
        return res.status(404).json({
          success: false,
          error: 'Book not found',
          message: `Book with ID ${bookId} not found`
        });
      }

      // Calculate item total
      const itemTotal = book.price * quantity;
      calculatedTotal += itemTotal;

      // Add to processed items
      processedItems.push({
        book: bookId,
        quantity,
        price: book.price,
        title: book.title,
        publisher: book.publisher,
        image: book.image
      });
    }

    // Validate calculated total matches provided total
    if (Math.abs(calculatedTotal - totalPrice) > 0.01) {
      logger.logOrderOperation('total_mismatch', null, {
        calculatedTotal,
        providedTotal: totalPrice,
        customerEmail: customer.email
      });
      return res.status(400).json({
        success: false,
        error: 'Total price mismatch',
        message: 'Calculated total does not match provided total',
        calculatedTotal,
        providedTotal: totalPrice
      });
    }

    // Create order object
    const orderData = {
      customer: {
        name: customer.name,
        organization: customer.organization || '',
        phone: customer.phone,
        email: customer.email,
        address: customer.address
      },
      items: processedItems,
      totalPrice: calculatedTotal,
      shippingAddress: customer.address,
      notes: notes || ''
    };

    logger.logDbQuery('create', 'orders', orderData, 0);

    // Create the order
    const order = new Order(orderData);
    await order.save();

    const queryTime = Date.now() - startTime;
    logger.logPerformance('createOrder', queryTime, {
      orderId: order.orderId,
      itemCount: processedItems.length,
      totalPrice: calculatedTotal
    });

    logger.logOrderOperation('created', order.orderId, {
      customerEmail: customer.email,
      itemCount: processedItems.length,
      totalPrice: calculatedTotal
    });

    // Send email notifications
    try {
      // Send notification to owner
      await sendOrderNotificationToOwner(order);
      logger.info('Order notification email sent to owner', { orderId: order.orderId });
      
      // Send confirmation to customer
      await sendOrderConfirmationToCustomer(order);
      logger.info('Order confirmation email sent to customer', { 
        orderId: order.orderId, 
        customerEmail: customer.email 
      });
    } catch (emailError) {
      // Log email error but don't fail the order creation
      logger.error('Failed to send order emails', {
        orderId: order.orderId,
        error: emailError.message
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: order.orderId,
        orderId: order.orderId,
        customer: order.customer,
        items: order.items,
        totalPrice: order.totalPrice,
        status: order.status,
        orderDate: order.createdAt
      },
      message: 'Order created successfully',
      meta: {
        orderId: order.orderId,
        queryTime: `${queryTime}ms`
      }
    });

  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.logApiError('POST', req.originalUrl, 500, error, req.get('User-Agent'));
    logger.logDbError('create', 'orders', error);

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Please check your input data',
        details: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate order',
        message: 'An order with this ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.logApiRequest('GET', req.originalUrl, 200, 0, req.get('User-Agent'));
    logger.logOrderOperation('fetch', id);

    const query = { orderId: id };
    logger.logDbQuery('findOne', 'orders', query, 0);

    const order = await Order.findOne(query).populate('items.book', 'title publisher image').lean();

    if (!order) {
      logger.logOrderOperation('fetch_not_found', id);
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: `No order found with ID: ${id}`
      });
    }

    const queryTime = Date.now() - startTime;
    logger.logPerformance('getOrderById', queryTime, { orderId: id });

    res.status(200).json({
      success: true,
      data: order,
      // meta: {
      //   queryTime: `${queryTime}ms`
      // }
    });

  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.logApiError('GET', req.originalUrl, 500, error, req.get('User-Agent'));
    logger.logDbError('findOne', 'orders', error, { id });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
      message: error.message
    });
  }
};

// @desc    Get orders by customer email
// @route   GET /api/orders/customer/:email
// @access  Public
const getOrdersByCustomer = async (req, res) => {
  const startTime = Date.now();
  const { email } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    logger.logApiRequest('GET', req.originalUrl, 200, 0, req.get('User-Agent'));
    logger.logOrderOperation('fetch_by_customer', null, { customerEmail: email });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { 'customer.email': email.toLowerCase() };

    logger.logDbQuery('find', 'orders', query, 0);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query)
    ]);

    const queryTime = Date.now() - startTime;
    logger.logPerformance('getOrdersByCustomer', queryTime, {
      customerEmail: email,
      totalOrders: total,
      returnedOrders: orders.length
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      },
      meta: {
        customerEmail: email,
        queryTime: `${queryTime}ms`
      }
    });

  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.logApiError('GET', req.originalUrl, 500, error, req.get('User-Agent'));
    logger.logDbError('find', 'orders', error, { email });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer orders',
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByCustomer
};
