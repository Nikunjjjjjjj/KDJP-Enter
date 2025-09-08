const mongoose = require('mongoose');
const Book = require('../models/Book');
const logger = require('../utils/logger');
require('dotenv').config();

// Sample books data
const sampleBooks = [
  {
    title: 'The Great Gatsby',
    publisher: 'Scribner',
    class: 'Fiction',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    description: 'A classic American novel about the Jazz Age and the American Dream.',
    isbn: '978-0743273565'
  },
  {
    title: 'To Kill a Mockingbird',
    publisher: 'Harper Perennial',
    class: 'Fiction',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    description: 'A powerful story of racial injustice and loss of innocence in the American South.',
    isbn: '978-0061120084'
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    publisher: 'Harper',
    class: 'Non-Fiction',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    description: 'An exploration of how an insignificant ape became the ruler of planet Earth.',
    isbn: '978-0062316097'
  },
  {
    title: 'Introduction to Algorithms',
    publisher: 'MIT Press',
    class: 'Academic',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=600&fit=crop',
    description: 'A comprehensive guide to algorithms and their analysis.',
    isbn: '978-0262033848'
  },
  {
    title: 'The Very Hungry Caterpillar',
    publisher: 'Philomel Books',
    class: "Children's",
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    description: 'A beloved children\'s book about a caterpillar\'s transformation into a butterfly.',
    isbn: '978-0399226908'
  },
  {
    title: 'The Hunger Games',
    publisher: 'Scholastic Press',
    class: 'Young Adult',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    description: 'A dystopian novel about survival and rebellion in a post-apocalyptic world.',
    isbn: '978-0439023481'
  },
  {
    title: '1984',
    publisher: 'Signet Classic',
    class: 'Fiction',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
    description: 'George Orwell\'s dystopian masterpiece about totalitarianism and surveillance.',
    isbn: '978-0451524935'
  },
  {
    title: 'The Art of War',
    publisher: 'Shambhala',
    class: 'Non-Fiction',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    description: 'Ancient Chinese text on military strategy and tactics.',
    isbn: '978-1590302255'
  },
  {
    title: 'Calculus: Early Transcendentals',
    publisher: 'Cengage Learning',
    class: 'Academic',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop',
    description: 'Comprehensive calculus textbook for advanced mathematics students.',
    isbn: '978-1337613927'
  },
  {
    title: 'Where the Wild Things Are',
    publisher: 'Harper & Row',
    class: "Children's",
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    description: 'A classic picture book about imagination and adventure.',
    isbn: '978-0060254926'
  },
  {
    title: 'The Fault in Our Stars',
    publisher: 'Dutton Books',
    class: 'Young Adult',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    description: 'A touching story about love, life, and the human condition.',
    isbn: '978-0525478812'
  },
  {
    title: 'Pride and Prejudice',
    publisher: 'Penguin Classics',
    class: 'Fiction',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    description: 'Jane Austen\'s beloved novel about love, marriage, and social class.',
    isbn: '978-0141439518'
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('Connected to MongoDB for seeding');
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error: error.message });
    process.exit(1);
  }
};

// Seed the database
const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Clear existing books
    await Book.deleteMany({});
    logger.info('Cleared existing books');

    // Insert sample books
    const books = await Book.insertMany(sampleBooks);
    logger.info(`Successfully seeded ${books.length} books`);

    // Log some statistics
    const totalBooks = await Book.countDocuments();

    logger.info('Seeding completed successfully', {
      totalBooks,
      booksByClass: await Book.aggregate([
        { $group: { _id: '$class', count: { $sum: 1 } } }
      ])
    });

  } catch (error) {
    logger.error('Failed to seed database', { error: error.message });
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await seedDatabase();
    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', { error: error.message });
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { seedDatabase, connectDB };
