const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'studysync_jwt_super_secret_key_2026';

/**
 * Hash password with a unique cryptographic salt using PBKDF2
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

/**
 * Verify password against stored salt and hash
 */
function verifyPassword(password, salt, storedHash) {
  if (!password || !salt || !storedHash) return false;
  try {
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (hashBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, storedBuf);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

/**
 * Sanitizes user object. Explicitly whitelists public fields:
 * (id, name, avatar, role, gradeClass, section, badges, xp, level)
 * as well as public bio, specialty, and stats when isOwner is false.
 * Sensitive credentials (password, salt, hash, passwordHash) are ALWAYS stripped.
 * Private keys (geminiApiKey) and email are ONLY visible to the account owner (isOwner = true).
 */
function sanitizeUser(user, isOwner = false) {
  if (!user) return null;

  // Explicit public fields whitelist
  const publicUser = {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    gradeClass: user.gradeClass,
    section: user.section,
    badges: user.badges || [],
    xp: user.xp || 0,
    level: user.level || 1,
    bio: user.bio || '',
    specialty: user.specialty,
    stats: user.stats || {}
  };

  if (isOwner) {
    return {
      ...publicUser,
      email: user.email,
      createdClasses: user.createdClasses || [],
      joinedClasses: user.joinedClasses || [],
      streak: user.streak || 0,
      createdAt: user.createdAt,
      geminiApiKey: user.geminiApiKey || ''
    };
  }

  return publicUser;
}

/**
 * Generate standard signed JWT session token (valid for 7 days)
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = {
  hashPassword,
  verifyPassword,
  sanitizeUser,
  generateToken
};
