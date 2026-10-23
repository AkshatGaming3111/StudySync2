const jwt = require('jsonwebtoken');
const store = require('../data/store');

const JWT_SECRET = process.env.JWT_SECRET || 'studysync_jwt_super_secret_key_2026';

/**
 * Extract token from Authorization header or query parameter
 */
function extractToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      return parts[1].trim();
    }
    return authHeader.trim();
  }
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}

/**
 * Verify JWT Bearer token middleware
 * Attaches authenticated user object to req.user
 */
function verifyToken(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied: Authentication token is required.'
    });
  }

  // 1. Check signed JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.findById('users', decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session: User account not found.'
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    // 2. Backward compatibility fallback for active legacy sessions
    if (token.startsWith('studysync_tok_')) {
      const users = store.get('users');
      const matchedUser = users.find(u => token.includes(`studysync_tok_${u.id}_`));
      if (matchedUser) {
        req.user = matchedUser;
        return next();
      }
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please sign in again.'
    });
  }
}

/**
 * Optional authentication: decodes token if present, but does not block if omitted
 */
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.findById('users', decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (e) {
    if (token.startsWith('studysync_tok_')) {
      const users = store.get('users');
      const matchedUser = users.find(u => token.includes(`studysync_tok_${u.id}_`));
      if (matchedUser) req.user = matchedUser;
    }
  }
  next();
}

/**
 * Enforce role-based access control (RBAC)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied: Action requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'.`
      });
    }

    next();
  };
}

const requireTeacher = requireRole('teacher');
const requireStudent = requireRole('student');

module.exports = {
  JWT_SECRET,
  verifyToken,
  optionalAuth,
  requireRole,
  requireTeacher,
  requireStudent
};
