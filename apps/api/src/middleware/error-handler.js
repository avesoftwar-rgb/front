// Enhanced Error Handling Middleware for Production

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// MongoDB Error Handler
const handleMongoDBError = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new AppError(
      `Duplicate value for field: ${field}`,
      400,
      'DUPLICATE_VALUE'
    );
  }
  
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return new AppError(
      `Validation failed: ${errors.join(', ')}`,
      400,
      'VALIDATION_ERROR'
    );
  }
  
  if (error.name === 'CastError') {
    return new AppError(
      `Invalid ${error.path}: ${error.value}`,
      400,
      'CAST_ERROR'
    );
  }
  
  return error;
};

// Async Error Catcher
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Global Error Handler
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
  } else {
    // Log only error message in production
    console.error('Error:', err.message);
  }
  
  // Handle MongoDB errors
  if (err.name && err.name.includes('Mongo')) {
    error = handleMongoDBError(err);
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, 'JWT_ERROR');
  }
  
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }
  
  // Set default values
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const code = error.code || 'INTERNAL_ERROR';
  
  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    },
    timestamp: new Date().toISOString()
  });
};

// 404 Handler
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Endpoint not found: ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

// Validation Middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(message, 400, 'VALIDATION_ERROR'));
    }
    next();
  };
};

module.exports = {
  AppError,
  catchAsync,
  globalErrorHandler,
  notFoundHandler,
  validate
};
