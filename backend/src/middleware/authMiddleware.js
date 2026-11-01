const jwt = require('jsonwebtoken');

/**
 * Custom JWT Authentication Middleware
 * Validates JSON Web Token in the Authorization header (Bearer format).
 * Note: Implemented entirely from scratch as required, bypassing Supabase Auth.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization header provided. Please login as admin.'
    });
  }

  // Expect header format: Bearer <token>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Format must be: Bearer <token>'
    });
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET || 'edtech_crm_super_secret_jwt_key_2026';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication token has expired. Please log in again.'
        });
      }
      return res.status(403).json({
        success: false,
        message: 'Invalid or malformed authentication token.'
      });
    }

    // Attach decoded admin payload to request
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'admin'
    };

    next();
  });
};

module.exports = {
  authenticateToken
};
