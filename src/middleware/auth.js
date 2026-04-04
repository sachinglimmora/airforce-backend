const jwt = require('jsonwebtoken');
const { users } = require('../data/db');

/**
 * Verifies the Bearer JWT from the Authorization header.
 * Attaches the full user object to req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = users.find(u => u.id === payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

/**
 * Role-based authorization middleware factory.
 * Usage: authorize('admin') or authorize(['admin', 'instructor'])
 */
function authorize(...roles) {
  const allowed = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${allowed.join(' or ')}.` });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
