const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const socketAuth = async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (token && token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    if (!token) {
      return next(new Error('Authentication error: Token not found'));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production'
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user to socket object
    socket.user = user;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid or expired token'));
  }
};

module.exports = socketAuth;
