const Book = require('../models/Book');
const logger = require('../utils/logger');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getAllBooks = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.logApiRequest('GET', req.originalUrl, 200, 0, req.get('User-Agent'));
    
    // Parse query parameters
    const { 
      page = 1, 
      limit = 10, 
      sort = 'title', 
      order = 'asc',
      minPrice,
      maxPrice,
      publisher,
      class: bookClass
    } = req.query;

    // Build query
    let query = { isActive: true };
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (publisher) {
      query.publisher = { $regex: publisher, $options: 'i' };
    }
    
    if (bookClass) {
      query.class = { $regex: bookClass, $options: 'i' };
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    logger.logDbQuery('find', 'books', query, 0);

    // Execute query
    const [books, total] = await Promise.all([
      Book.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Book.countDocuments(query)
    ]);

    const queryTime = Date.now() - startTime;
    logger.logPerformance('getAllBooks', queryTime, {
      totalBooks: total,
      returnedBooks: books.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBooks: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      },
      // meta: {
      //   queryTime: `${queryTime}ms`
      // }
    });
   // res.status(200).json({books});
  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.logApiError('GET', req.originalUrl, 500, error, req.get('User-Agent'));
    logger.logDbError('find', 'books', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch books',
      message: error.message
    });
  }
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.logApiRequest('GET', req.originalUrl, 200, 0, req.get('User-Agent'));
    logger.logBookOperation('fetch', id);

    const query = { _id: id, isActive: true };
    logger.logDbQuery('findOne', 'books', query, 0);

    const book = await Book.findById(id).lean();

    if (!book) {
      logger.logBookOperation('fetch_not_found', id);
      return res.status(404).json({
        success: false,
        error: 'Book not found',
        message: `No book found with ID: ${id}`
      });
    }

    const queryTime = Date.now() - startTime;
    logger.logPerformance('getBookById', queryTime, { bookId: id });

    res.status(200).json({
      success: true,
      data: book,
      meta: {
        queryTime: `${queryTime}ms`
      }
    });

  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.logApiError('GET', req.originalUrl, 500, error, req.get('User-Agent'));
    logger.logDbError('findOne', 'books', error, { id });

    // Check if it's an invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid book ID',
        message: 'Please provide a valid book ID'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch book',
      message: error.message
    });
  }
};

// @desc    Search books
// @route   GET /api/books/search?q=:query
// @access  Public
const searchBooks = async (req, res) => {
  const startTime = Date.now();
  const { q: query, page = 1, limit = 10 } = req.query;

  try {
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Search query required',
        message: 'Please provide a search query'
      });
    }

    logger.logApiRequest('GET', req.originalUrl, 200, 0, req.get('User-Agent'));
    logger.logBookOperation('search', null, { query });

    const searchQuery = query.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Use the static search method from the Book model
    const dbQuery = {
      $and: [
        { isActive: true },
        {
          $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { publisher: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { class: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      ]
    };

    logger.logDbQuery('search', 'books', dbQuery, 0);

    const [books, total] = await Promise.all([
      Book.find(dbQuery)
        .sort({ title: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Book.countDocuments(dbQuery)
    ]);

    const queryTime = Date.now() - startTime;
    logger.logPerformance('searchBooks', queryTime, {
      query: searchQuery,
      totalResults: total,
      returnedResults: books.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalResults: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      },
      meta: {
        query: searchQuery,
        queryTime: `${queryTime}ms`
      }
    });

  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.logApiError('GET', req.originalUrl, 500, error, req.get('User-Agent'));
    logger.logDbError('search', 'books', error, { query });

    res.status(500).json({
      success: false,
      error: 'Failed to search books',
      message: error.message
    });
  }
};

// @desc    Get books by class/genre
// @route   GET /api/books/class/:class
// @access  Public
const getBooksByClass = async (req, res) => {
  const startTime = Date.now();
  const { class: bookClass } = req.params;
  const { page = 1, limit = 10, sort = 'title', order = 'asc' } = req.query;

  try {
    if (!bookClass || bookClass.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Class parameter required',
        message: 'Please provide a book class/genre'
      });
    }

    logger.logApiRequest('GET', req.originalUrl, 200, 0, req.get('User-Agent'));
    logger.logBookOperation('fetch_by_class', null, { class: bookClass });

    const searchClass = bookClass.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const query = { 
      class: { $regex: searchClass, $options: 'i' }, 
      isActive: true 
    };

    logger.logDbQuery('find', 'books', query, 0);

    const [books, total] = await Promise.all([
      Book.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Book.countDocuments(query)
    ]);

    const queryTime = Date.now() - startTime;
    logger.logPerformance('getBooksByClass', queryTime, {
      class: searchClass,
      totalBooks: total,
      returnedBooks: books.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBooks: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      },
      meta: {
        class: searchClass,
        queryTime: `${queryTime}ms`
      }
    });

  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.logApiError('GET', req.originalUrl, 500, error, req.get('User-Agent'));
    logger.logDbError('find', 'books', error, { class: bookClass });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch books by class',
      message: error.message
    });
  }
};

// @desc    Get available book classes
// @route   GET /api/books/classes
// @access  Public
const getAvailableClasses = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.logApiRequest('GET', req.originalUrl, 200, 0, req.get('User-Agent'));

    const query = { isActive: true, class: { $exists: true, $ne: '' } };
    logger.logDbQuery('distinct', 'books', query, 0);

    const classes = await Book.distinct('class', query);
    const sortedClasses = classes.sort();

    const queryTime = Date.now() - startTime;
    logger.logPerformance('getAvailableClasses', queryTime, {
      totalClasses: sortedClasses.length
    });

    res.status(200).json({
      success: true,
      data: sortedClasses,
      meta: {
        totalClasses: sortedClasses.length,
        queryTime: `${queryTime}ms`
      }
    });

  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.logApiError('GET', req.originalUrl, 500, error, req.get('User-Agent'));
    logger.logDbError('distinct', 'books', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch available classes',
      message: error.message
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  searchBooks,
  getBooksByClass,
  getAvailableClasses
};
