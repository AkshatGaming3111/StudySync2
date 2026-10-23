const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { verifyToken, requireTeacher } = require('../middleware/auth');

// Get Global Leaderboard
router.get('/global', (req, res) => {
  const users = store.get('users').filter(u => u.role === 'student');
  const badges = store.get('badges');

  const ranked = [...users]
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .map((user, idx) => {
      const userBadges = (user.badges || []).map(bid => badges.find(b => b.id === bid)).filter(Boolean);
      const avgScore = user.stats?.averageQuizScore || (user.xp ? Math.min(100, Math.max(75, 80 + Math.round((user.xp % 300) / 15))) : 90);

      return {
        rank: idx + 1,
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        gradeLevel: user.gradeLevel || user.gradeClass,
        gradeClass: user.gradeClass,
        section: user.section,
        score: user.xp || 0,
        xp: user.xp || 0,
        percentage: avgScore,
        level: user.level || 1,
        streak: user.streak || 0,
        stats: user.stats || {},
        badges: userBadges
      };
    });

  res.json({ success: true, leaderboard: ranked });
});

// Get Cohort Leaderboard (by Grade and Section)
router.get('/cohort', (req, res) => {
  const { gradeClass = 'Grade 10', section = 'B' } = req.query;
  const users = store.get('users').filter(u => 
    u.role === 'student' && 
    (!gradeClass || (u.gradeClass && u.gradeClass.toLowerCase() === gradeClass.toLowerCase())) &&
    (!section || (u.section && u.section.toUpperCase() === section.toUpperCase()))
  );
  const badges = store.get('badges');

  const ranked = [...users]
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .map((user, idx) => {
      const userBadges = (user.badges || []).map(bid => badges.find(b => b.id === bid)).filter(Boolean);
      const avgScore = user.stats?.averageQuizScore || (user.xp ? Math.min(100, Math.max(75, 80 + Math.round((user.xp % 300) / 15))) : 90);

      return {
        rank: idx + 1,
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        gradeLevel: user.gradeLevel || user.gradeClass,
        gradeClass: user.gradeClass,
        section: user.section,
        score: user.xp || 0,
        xp: user.xp || 0,
        percentage: avgScore,
        level: user.level || 1,
        streak: user.streak || 0,
        stats: user.stats || {},
        badges: userBadges
      };
    });

  res.json({
    success: true,
    gradeClass,
    section,
    leaderboard: ranked
  });
});

// Get Classroom Leaderboard
router.get('/class/:classId', (req, res) => {
  const classItem = store.findById('classes', req.params.classId);
  if (!classItem) {
    return res.status(404).json({ success: false, error: 'Class not found' });
  }

  const users = store.get('users');
  const badges = store.get('badges');

  const enrolledStudentIds = new Set(classItem.studentIds || []);
  const titleLower = (classItem.title || '').toLowerCase();

  users.filter(u => u.role === 'student').forEach(u => {
    if (u.joinedClasses && u.joinedClasses.includes(classItem.id)) {
      enrolledStudentIds.add(u.id);
    }
    // Match grade & section for cohort classes (e.g. Class 10 B or Grade 10 core subjects)
    if (u.gradeClass === 'Grade 10' && (
      classItem.id === 'c_science_physics' || 
      classItem.id === 'c_maths_geom' || 
      classItem.id === 'c_it_tech' || 
      titleLower.includes('10 b') || 
      titleLower.includes('class 10') ||
      classItem.gradeLevel === 'Grade 10'
    )) {
      enrolledStudentIds.add(u.id);
    }
  });

  const enrolledStudents = Array.from(enrolledStudentIds)
    .map(sid => users.find(u => u.id === sid))
    .filter(Boolean);

  const ranked = [...enrolledStudents]
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .map((user, idx) => {
      const userBadges = (user.badges || []).map(bid => badges.find(b => b.id === bid)).filter(Boolean);
      const avgScore = user.stats?.averageQuizScore || (user.xp ? Math.min(100, Math.max(75, 80 + Math.round((user.xp % 300) / 15))) : 90);

      return {
        rank: idx + 1,
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        gradeLevel: user.gradeLevel || user.gradeClass,
        gradeClass: user.gradeClass,
        section: user.section,
        score: user.xp || 0,
        xp: user.xp || 0,
        percentage: avgScore,
        level: user.level || 1,
        streak: user.streak || 0,
        stats: user.stats || {},
        badges: userBadges
      };
    });

  res.json({
    success: true,
    classId: classItem.id,
    className: classItem.title,
    leaderboard: ranked
  });
});

// Get Badges / Achievements directory
router.get('/badges', (req, res) => {
  const badges = store.get('badges');
  res.json({ success: true, badges });
});

// Reset database (Teacher only: verified token and role check)
router.post('/reset', verifyToken, requireTeacher, (req, res) => {
  store.reset();
  res.json({ success: true, message: 'Database reset to initial demo state.' });
});

module.exports = router;
