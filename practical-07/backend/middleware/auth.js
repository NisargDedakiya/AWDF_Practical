const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token from 'Authorization: Bearer <token>' header
 * Attaches decoded user payload ({ id, email, name }) to req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Missing or malformed Authorization header. Expected "Bearer <token>".'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Token is missing.'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'supersecret_jwt_key_practical7_awdf_24cs014';
    const decoded = jwt.verify(token, jwtSecret);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid token. Authentication failed.'
    });
  }
};

module.exports = authMiddleware;
