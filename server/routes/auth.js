const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { hashPassword, verifyPassword, sanitizeUser, generateToken } = require('../services/authHelper');

// Register new user (Student or Teacher)
router.post('/register', (req, res) => {
  const { name, email, password, role, gradeClass, section, specialty, bio, avatar } = req.body;

  if (!name || !email || !password || !role || !gradeClass || !section) {
    return res.status(400).json({
      success: false,
      error: 'Please fill all required fields: Name, Email, Password, Role, Class, and Section.'
    });
  }

  if (password.trim().length < 4) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 4 characters long.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = store.get('users');
  const existing = users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);
  
  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'An account with this email address already exists. Please sign in instead.'
    });
  }

  // Securely hash password with salt
  const { salt, hash } = hashPassword(password.trim());

  const defaultAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  const newUser = {
    id: `u_${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    salt,
    hash,
    role: role === 'teacher' ? 'teacher' : 'student',
    gradeClass: gradeClass.trim(), // e.g. "Grade 10" or "Grade 11"
    section: section.trim().toUpperCase(), // e.g. "A", "B", "C"
    avatar: avatar || defaultAvatar,
    bio: bio ? bio.trim() : (role === 'teacher' ? `Educator • ${specialty || 'General STEM'}` : `Student • ${gradeClass} Section ${section}`),
    specialty: role === 'teacher' ? (specialty || 'General STEM') : undefined,
    createdClasses: [],
    joinedClasses: [],
    xp: 150,
    level: 1,
    streak: 1,
    badges: ['b_founder'],
    plan: 'free',
    usage: {
      aiQueriesToday: 0,
      lastResetDate: new Date().toISOString().split('T')[0]
    },
    createdAt: new Date().toISOString(),
    stats: {
      assignmentsCompleted: 0,
      quizzesCompleted: 0,
      averageQuizScore: 0,
      studyHours: 0,
      flashcardsMastered: 0
    }
  };

  // Auto-enroll student into matching grade level & section classes
  if (newUser.role === 'student') {
    const classes = store.get('classes');
    const matchedClassIds = [];
    classes.forEach(c => {
      const titleLower = (c.title || '').toLowerCase();
      const gradeMatches = c.gradeLevel === newUser.gradeClass || titleLower.includes(newUser.gradeClass.toLowerCase());
      if (gradeMatches || (newUser.gradeClass === 'Grade 10' && (c.id === 'c_science_physics' || c.id === 'c_maths_geom' || c.id === 'c_it_tech' || titleLower.includes('10')))) {
        matchedClassIds.push(c.id);
        const studentsSet = new Set(c.studentIds || []);
        studentsSet.add(newUser.id);
        store.update('classes', c.id, { studentIds: Array.from(studentsSet) });
      }
    });
    newUser.joinedClasses = matchedClassIds;
  }

  store.insert('users', newUser);

  // SANITIZE: Never expose password, salt, or hash to the frontend
  const safeUser = sanitizeUser(newUser, true);

  res.json({
    success: true,
    user: safeUser,
    token: generateToken(newUser)
  });
});

// Sign In with Email, Password, Class, and Section
router.post('/login', (req, res) => {
  const { email, password, gradeClass, section } = req.body;

  if (!email || !password || !gradeClass || !section) {
    return res.status(400).json({
      success: false,
      error: 'All 4 credentials are required to sign in: Registered Email, Password, Class, and Section.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedClass = gradeClass.trim().toLowerCase();
  const normalizedSection = section.trim().toUpperCase();

  const users = store.get('users');
  const user = users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'No account found with this email address. Please create an account first.'
    });
  }

  // Support both cryptographic salt/hash and legacy passwords if any
  let isPasswordValid = false;
  const userSalt = user.salt || user.passwordSalt;
  const userHash = user.hash || user.passwordHash;

  if (userSalt && userHash) {
    isPasswordValid = verifyPassword(password.trim(), userSalt, userHash);
  } else if (user.password) {
    isPasswordValid = user.password === password.trim();
    // Upgrade legacy user to cryptographic salt/hash on login
    if (isPasswordValid) {
      const { salt, hash } = hashPassword(password.trim());
      delete user.password;
      user.salt = salt;
      user.hash = hash;
      store.update('users', user.id, { salt, hash, password: undefined });
    }
  }

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Incorrect password. Please try again.'
    });
  }

  if (!user.gradeClass || user.gradeClass.toLowerCase() !== normalizedClass) {
    return res.status(400).json({
      success: false,
      error: `Invalid Class. Your account is registered under: ${user.gradeClass}`
    });
  }

  if (!user.section || user.section.toUpperCase() !== normalizedSection) {
    return res.status(400).json({
      success: false,
      error: `Invalid Section. Your account is registered under: Section ${user.section}`
    });
  }

  // SANITIZE: Zero credential exposure, return owner profile
  const safeUser = sanitizeUser(user, true);

  res.json({
    success: true,
    user: safeUser,
    token: generateToken(user)
  });
});

const { verifyToken, optionalAuth } = require('../middleware/auth');

// Get profile (Sanitized: whitelists public fields unless requested by owner)
router.get('/profile/:id', optionalAuth, (req, res) => {
  const user = store.findById('users', req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  const isOwner = req.user && req.user.id === req.params.id;
  const safeUser = sanitizeUser(user, isOwner);
  res.json({ success: true, user: safeUser });
});

// Update profile (Sanitized: only owner or teacher permitted)
router.put('/profile/:id', verifyToken, (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      error: 'Access denied: You may only modify your own profile.'
    });
  }

  const updates = { ...req.body };
  delete updates.password;
  delete updates.salt;
  delete updates.hash;
  delete updates.passwordHash;
  delete updates.id;

  const updated = store.update('users', req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  const isOwner = req.user.id === req.params.id;
  const safeUser = sanitizeUser(updated, isOwner);
  res.json({ success: true, user: safeUser });
});

// Delete account (Any user can delete their own account)
router.delete('/profile/:id', verifyToken, (req, res) => {
  const targetId = req.params.id;

  if (req.user.id !== targetId) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: You may only delete your own account.'
    });
  }

  const user = store.findById('users', targetId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  // Remove user from users collection
  store.delete('users', targetId);

  // Clean up user from enrolled classes
  const classes = store.get('classes');
  classes.forEach(c => {
    if (c.students && Array.isArray(c.students)) {
      c.students = c.students.filter(sId => sId !== targetId);
    }
  });
  store.save();

  res.json({
    success: true,
    message: 'Account deleted successfully.'
  });
});

// Demo users endpoint returns empty list
router.get('/demo-users', (req, res) => {
  res.json({ success: true, users: [] });
});

module.exports = router;
