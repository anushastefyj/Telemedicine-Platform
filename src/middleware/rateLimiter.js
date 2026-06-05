const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';

// Auth endpoints (login/register): 5 requests per 10 minutes
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isTest ? 10000 : 5,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 10 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment endpoints: 10 requests per 15 minutes
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 10,
  message: {
    success: false,
    message: 'Too many payment requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// All other endpoints: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  paymentLimiter,
  generalLimiter,
};
