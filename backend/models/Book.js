const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true // For search functionality
  },
  publisher: {
    type: String,
    required: [true, 'Publisher is required'],
    trim: true,
    maxlength: [100, 'Publisher name cannot exceed 100 characters'],
    index: true
  },
  class: {
    type: String,
    trim: true,
    maxlength: [50, 'Class name cannot exceed 50 characters'],
    index: true // For filtering by class/genre
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [10000, 'Price cannot exceed $10,000']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image must be a valid URL'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  isbn: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for search functionality
bookSchema.index({
  title: 'text',
  publisher: 'text',
  description: 'text',
  class: 'text'
});

// Compound indexes for efficient queries
bookSchema.index({ class: 1, isActive: 1 });
bookSchema.index({ price: 1, isActive: 1 });
bookSchema.index({ createdAt: -1 });

// Virtual for availability
bookSchema.virtual('isAvailable').get(function() {
  return this.isActive;
});

// Pre-save middleware to update the updatedAt field
bookSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get books by class
bookSchema.statics.findByClass = function(bookClass) {
  return this.find({ class: bookClass, isActive: true });
};

// Static method to search books
bookSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { publisher: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { class: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  });
};



module.exports = mongoose.model('Book', bookSchema);
