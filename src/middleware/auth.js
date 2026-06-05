const jwt = require('jsonwebtoken');
const { ErrorResponse } = require('./error');
const { User } = require('../models/User');
const Admin = require('../models/Admin');
const logger = require('../config/logger');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production');

    // Attach user to the request object, check User first
    let user = await User.findById(decoded.id);

    if (!user) {
      // Check Admin collection
      user = await Admin.findById(decoded.id);
    }

    if (!user) {
      return next(new ErrorResponse('No user found with this id', 404));
    }

    req.user = user;
    next();
  } catch (err) {
    if (logger && logger.error) {
      logger.error(`JWT Verification Error: ${err.message}`);
    } else {
      console.error(`JWT Verification Error: ${err.message}`);
    }
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user ? req.user.role : 'guest'} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

const restrictTo = authorize;

module.exports = { protect, authorize, restrictTo };
