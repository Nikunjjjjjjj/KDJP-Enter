'use client';
import React, { useState, useEffect, useRef } from 'react';
import BookCard from '@/components/ui/BookCard';
import Button from '@/components/ui/Button';
import { bookApi } from '@/utils/api';
import { Book } from '@/types';
import { logger } from '@/utils/logger';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'publisher'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availablePublishers, setAvailablePublishers] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load initial books and classes
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Load books
        const booksResponse = await bookApi.getAllBooks({
          sort: sortBy,
          order: sortOrder,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          publisher: selectedPublisher,
          class: selectedClass
        });

        if (booksResponse.success && booksResponse.data) {
          const booksData = booksResponse.data;
          setBooks(booksData);
          setFilteredBooks(booksData);
          
          // Extract unique publishers
          const publishers = Array.from(new Set(booksData.map(book => book.publisher))).sort();
          setAvailablePublishers(publishers);
        } else {
          setError(booksResponse.error || 'Failed to load books');
        }

        // Load available classes
        const classesResponse = await bookApi.getAvailableClasses();
        if (classesResponse.success && classesResponse.data) {
          setAvailableClasses(classesResponse.data);
        }

      } catch (error) {
        logger.error('Failed to load initial data', { error });
        setError('Failed to load books. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Generate search suggestions from current books
  const generateSuggestions = (query: string): string[] => {
    if (!query.trim() || !Array.isArray(books) || books.length === 0) return [];
    
    const allSuggestions = new Set<string>();
    
    // Add book titles
    books.forEach(book => {
      if (book.title.toLowerCase().includes(query.toLowerCase())) {
        allSuggestions.add(book.title);
      }
    });
    
    // Add publishers
    books.forEach(book => {
      if (book.publisher.toLowerCase().includes(query.toLowerCase())) {
        allSuggestions.add(book.publisher);
      }
    });
    
    // Add classes
    books.forEach(book => {
      if (book.class && book.class.toLowerCase().includes(query.toLowerCase())) {
        allSuggestions.add(book.class);
      }
    });
    
    return Array.from(allSuggestions).slice(0, 8); // Limit to 8 suggestions
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
    
    logger.info('Search query updated', { query: value, suggestionsCount: suggestions.length });
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    logger.info('Search suggestion selected', { suggestion });
  };

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply filters and search
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setIsSearching(true);
        setError('');

        let response;
        
        if (searchQuery.trim()) {
          // Use search API
          response = await bookApi.searchBooks(searchQuery, 1, 100);
        } else {
          // Use filtered books API
          response = await bookApi.getAllBooks({
            sort: sortBy,
            order: sortOrder,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
            publisher: selectedPublisher,
            class: selectedClass
          });
        }

        if (response.success && response.data) {
          const booksData = response.data;
          setFilteredBooks(booksData);
          
          logger.info('Filters applied', {
            searchQuery,
            selectedClass,
            selectedPublisher,
            priceRange,
            sortBy,
            sortOrder,
            resultsCount: booksData.length
          });
        } else {
          setError(response.error || 'Failed to apply filters');
        }
      } catch (error) {
        logger.error('Failed to apply filters', { error });
        setError('Failed to apply filters. Please try again.');
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(applyFilters, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedClass, selectedPublisher, priceRange, sortBy, sortOrder]);

  const handleClassFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    logger.info('Class filter changed', { class: e.target.value });
  };

  const handlePublisherFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPublisher(e.target.value);
    logger.info('Publisher filter changed', { publisher: e.target.value });
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? (type === 'min' ? 0 : 100) : parseFloat(value);
    setPriceRange((prev: { min: number; max: number }) => ({
      ...prev,
      [type]: numValue
    }));
    logger.info('Price range changed', { type, value: numValue });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'title' | 'price' | 'publisher');
    logger.info('Sort field changed', { sortBy: e.target.value });
  };

  const handleSortOrderToggle = () => {
    setSortOrder((prev: 'asc' | 'desc') => prev === 'asc' ? 'desc' : 'asc');
    logger.info('Sort order toggled', { newOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedClass('');
    setSelectedPublisher('');
    setPriceRange({ min: 0, max: 1000000 });
    setSortBy('title');
    setSortOrder('asc');
    setShowSuggestions(false);
    setSuggestions([]);
    logger.info('All filters cleared');
  };

  const hasActiveFilters = searchQuery || selectedClass || selectedPublisher || priceRange.min > 0 || priceRange.max < 1000000;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Our Bookstore</h1>
        <p className="text-gray-600">Discover your next favorite book from our curated collection</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Search Bar with Auto-suggestions */}
        <div className="relative mb-6">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by title, publisher, or class..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          {/* Auto-suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                >
                  <span className="text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Toggle Button */}
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters {showFilters ? '−' : '+'}
          </Button>
          
          {hasActiveFilters && (
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Class
              </label>
              <select
                value={selectedClass}
                onChange={handleClassFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Classes</option>
                {availableClasses.map((bookClass) => (
                  <option key={bookClass} value={bookClass}>
                    {bookClass}
                  </option>
                ))}
              </select>
            </div>

            {/* Publisher Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publisher
              </label>
              <select
                value={selectedPublisher}
                onChange={handlePublisherFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Publishers</option>
                {availablePublishers.map((publisher) => (
                  <option key={publisher} value={publisher}>
                    {publisher}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min === 0 ? '' : priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="0"
                  step="0.01"
                />
                <span className="flex items-center text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max === 1000000 ? '' : priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="title">Title</option>
              <option value="price">Price</option>
              <option value="publisher">Publisher</option>
            </select>
            <button
              onClick={handleSortOrderToggle}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {filteredBooks.length} of {books.length} books
          {hasActiveFilters && ' (filtered)'}
        </p>
      </div>

      {/* Loading State */}
      {(isLoading || isSearching) && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )}

      {/* Books Grid */}
      {!isLoading && !isSearching && (
        <>
          {filteredBooks.length > 0 ? (
            <div className="book-grid">
              {filteredBooks.map((book) => (
                <BookCard key={book._id || book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
              {hasActiveFilters && (
                <div className="mt-6">
                  <Button onClick={clearFilters} variant="primary">
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 