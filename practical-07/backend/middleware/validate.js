/**
 * Input Validation Middleware Pipeline
 * Validates request bodies before reaching controller logic
 */

const emailRegex = /^\S+@\S+\.\S+$/;

// Validate User Registration inputs
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required');
  }

  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Validate User Login inputs
const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Validate Task inputs
const validateTask = (req, res, next) => {
  const { title, priority } = req.body || {};
  const errors = [];

  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      errors.push('Task title is required and cannot be empty');
    }
  } else if (req.method === 'PUT' && title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      errors.push('Task title cannot be empty');
    }
  }

  if (title && title.length > 100) {
    errors.push('Title cannot exceed 100 characters');
  }

  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    errors.push("Priority must be either 'low', 'medium', or 'high'");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTask
};
