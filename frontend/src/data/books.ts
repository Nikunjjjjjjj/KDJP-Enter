import { Book } from '@/types';

export const sampleBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    publisher: 'Scribner',
    class: 'Fiction',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    description: 'A classic American novel about the Jazz Age and the American Dream.',
    isbn: '978-0743273565'
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    publisher: 'Harper Perennial',
    class: 'Fiction',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    description: 'A powerful story of racial injustice and loss of innocence in the American South.',
    isbn: '978-0061120084'
  },
  {
    id: '3',
    title: 'Sapiens: A Brief History of Humankind',
    publisher: 'Harper',
    class: 'Non-Fiction',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    description: 'An exploration of how an insignificant ape became the ruler of planet Earth.',
    isbn: '978-0062316097'
  },
  {
    id: '4',
    title: 'Introduction to Algorithms',
    publisher: 'MIT Press',
    class: 'Academic',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=600&fit=crop',
    description: 'A comprehensive guide to algorithms and their analysis.',
    isbn: '978-0262033848'
  },
  {
    id: '5',
    title: 'The Very Hungry Caterpillar',
    publisher: 'Philomel Books',
    class: "Children's",
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    description: 'A beloved children\'s book about a caterpillar\'s transformation into a butterfly.',
    isbn: '978-0399226908'
  },
  {
    id: '6',
    title: 'The Hunger Games',
    publisher: 'Scholastic Press',
    class: 'Young Adult',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    description: 'A dystopian novel about survival and rebellion in a post-apocalyptic world.',
    isbn: '978-0439023481'
  },
  {
    id: '7',
    title: '1984',
    publisher: 'Signet Classic',
    class: 'Fiction',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
    description: 'George Orwell\'s dystopian masterpiece about totalitarianism and surveillance.',
    isbn: '978-0451524935'
  },
  {
    id: '8',
    title: 'The Art of War',
    publisher: 'Shambhala',
    class: 'Non-Fiction',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    description: 'Ancient Chinese text on military strategy and tactics.',
    isbn: '978-1590302255'
  },
  {
    id: '9',
    title: 'Calculus: Early Transcendentals',
    publisher: 'Cengage Learning',
    class: 'Academic',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop',
    description: 'Comprehensive calculus textbook for advanced mathematics students.',
    isbn: '978-1337613927'
  },
  {
    id: '10',
    title: 'Where the Wild Things Are',
    publisher: 'Harper & Row',
    class: "Children's",
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    description: 'A classic picture book about imagination and adventure.',
    isbn: '978-0060254926'
  },
  {
    id: '11',
    title: 'The Fault in Our Stars',
    publisher: 'Dutton Books',
    class: 'Young Adult',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    description: 'A touching story about love, life, and the human condition.',
    isbn: '978-0525478812'
  },
  {
    id: '12',
    title: 'Pride and Prejudice',
    publisher: 'Penguin Classics',
    class: 'Fiction',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    description: 'Jane Austen\'s beloved novel about love, marriage, and social class.',
    isbn: '978-0141439518'
  }
];

// Helper function to get books by class/genre
export const getBooksByClass = (bookClass: string): Book[] => {
  return sampleBooks.filter(book => book.class === bookClass);
};

// Helper function to get all available classes
export const getAvailableClasses = (): string[] => {
  const classes = sampleBooks.map(book => book.class).filter(Boolean);
  return [...new Set(classes)]; // Remove duplicates
};

// Helper function to search books by title or publisher
export const searchBooks = (query: string): Book[] => {
  const lowercaseQuery = query.toLowerCase();
  return sampleBooks.filter(book => 
    book.title.toLowerCase().includes(lowercaseQuery) ||
    book.publisher.toLowerCase().includes(lowercaseQuery) ||
    (book.class && book.class.toLowerCase().includes(lowercaseQuery))
  );
}; 