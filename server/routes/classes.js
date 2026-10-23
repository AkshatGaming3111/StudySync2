const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { sanitizeUser, hashPassword } = require('../services/authHelper');
const { verifyToken, requireTeacher } = require('../middleware/auth');

// Helper to generate unique 6-char room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get all classes (optional filter by user or role)
router.get('/', (req, res) => {
  const { userId, role } = req.query;
  let classes = store.get('classes');

  if (userId) {
    if (role === 'teacher') {
      classes = classes.filter(c => c.teacherId === userId);
    } else {
      const user = store.findById('users', userId);
      const joinedSet = new Set(user?.joinedClasses || []);
      classes = classes.filter(c => {
        const titleLower = (c.title || '').toLowerCase();
        const inStudentIds = c.studentIds && c.studentIds.includes(userId);
        const inJoined = joinedSet.has(c.id);
        const matchesGrade = user?.gradeClass && (
          c.gradeLevel === user.gradeClass || 
          titleLower.includes(user.gradeClass.toLowerCase()) ||
          (user.gradeClass === 'Grade 10' && (c.id === 'c_science_physics' || c.id === 'c_maths_geom' || c.id === 'c_it_tech'))
        );
        return inStudentIds || inJoined || matchesGrade;
      });
    }
  }

  res.json({ success: true, classes });
});

// Get single class details
router.get('/:id', (req, res) => {
  const classItem = store.findById('classes', req.params.id);
  if (!classItem) {
    return res.status(404).json({ success: false, error: 'Class not found' });
  }

  // Populate student roster details (Sanitized with explicit public whitelist)
  const users = store.get('users');
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

  // Sync back to classItem.studentIds if newly discovered
  if (enrolledStudentIds.size !== (classItem.studentIds || []).length) {
    store.update('classes', classItem.id, { studentIds: Array.from(enrolledStudentIds) });
  }

  const students = Array.from(enrolledStudentIds).map(sid => {
    const u = users.find(user => user.id === sid);
    if (!u) return { id: sid, name: 'Student', avatar: '', role: 'student', gradeClass: '', section: '', badges: [], xp: 0, level: 1 };
    return sanitizeUser(u, false);
  });

  // Fetch associated assignments and tests count
  const assignments = store.get('assignments').filter(a => a.classId === classItem.id);
  const tests = store.get('tests').filter(t => t.classId === classItem.id);

  res.json({
    success: true,
    class: classItem,
    students,
    assignments,
    tests
  });
});

// Create new class (Teacher only: requires verified token and teacher role)
router.post('/', verifyToken, requireTeacher, (req, res) => {
  const teacherId = req.user.id;
  const { title, subject, gradeLevel, description, themeColor, bannerImage, schedule, roomLocation, aiTutorPersona } = req.body;

  if (!title || !subject) {
    return res.status(400).json({ success: false, error: 'Title and subject are required.' });
  }

  const teacher = store.findById('users', teacherId);
  const teacherPlan = teacher?.plan || 'free';
  const existingClasses = (store.get('classes') || []).filter(c => c.teacherId === teacherId);

  // Enforce Free Tier limitation (Max 2 classes)
  if (teacherPlan === 'free' && existingClasses.length >= 2) {
    return res.status(403).json({
      success: false,
      code: 'PLAN_LIMIT_REACHED',
      error: 'Free Starter plan is limited to 2 active classrooms. Upgrade to StudySync Pro or Institute plan to create unlimited classrooms.'
    });
  }

  const code = generateRoomCode();

  const themeColors = ['indigo', 'emerald', 'purple', 'rose', 'amber', 'cyan'];
  const defaultBanners = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80'
  ];

  const newClass = {
    id: `c_${Date.now()}`,
    code,
    title,
    subject,
    gradeLevel: gradeLevel || 'High School / AP Prep',
    description: description || 'Interactive AI-driven classroom on StudySync.',
    teacherId,
    teacherName: teacher ? teacher.name : 'Instructor',
    teacherAvatar: teacher ? teacher.avatar : '',
    themeColor: themeColor || themeColors[Math.floor(Math.random() * themeColors.length)],
    bannerImage: bannerImage || defaultBanners[Math.floor(Math.random() * defaultBanners.length)],
    studentIds: [],
    institute: teacher?.institute || null,
    schedule: schedule || 'Mon, Wed • 11:00 AM - 12:30 PM',
    roomLocation: roomLocation || 'Virtual Room ' + code,
    createdAt: new Date().toISOString(),
    aiTutorPersona: aiTutorPersona || 'Socratic Teaching Assistant',
    stream: [
      {
        id: `post_welcome_${Date.now()}`,
        authorId: teacherId,
        authorName: teacher ? teacher.name : 'Instructor',
        authorAvatar: teacher ? teacher.avatar : '',
        authorRole: 'teacher',
        title: `👋 Welcome to ${title}!`,
        content: `Welcome to our virtual classroom! Stream announcements, homework assignments, live SyncBoard whiteboard sessions, and AI study tools are now available. Share the room code **${code}** with your classmates.`,
        attachments: [],
        createdAt: new Date().toISOString(),
        reactions: { '🎉': 4, '🚀': 6 },
        comments: []
      }
    ]
  };

  // If the class is created for a grade level, auto-enroll existing students matching that grade level
  const users = store.get('users');
  const matchedStudents = users.filter(u => u.role === 'student' && u.gradeClass && (
    newClass.gradeLevel === u.gradeClass || 
    (newClass.title && newClass.title.toLowerCase().includes(u.gradeClass.toLowerCase()))
  ));
  matchedStudents.forEach(st => {
    newClass.studentIds.push(st.id);
    const joined = new Set(st.joinedClasses || []);
    joined.add(newClass.id);
    store.update('users', st.id, { joinedClasses: Array.from(joined) });
  });

  store.insert('classes', newClass);

  // Update teacher's createdClasses
  if (teacher) {
    const created = new Set(teacher.createdClasses || []);
    created.add(newClass.id);
    store.update('users', teacherId, { createdClasses: Array.from(created) });
    store.awardXP(teacherId, 100, 'Created a new interactive classroom');
  }

  res.json({ success: true, class: newClass });
});

// Join class via Room Code (Student)
router.post('/join', verifyToken, (req, res) => {
  const { code } = req.body;
  const studentId = req.user.id;

  if (!code) {
    return res.status(400).json({ success: false, error: 'Room code is required.' });
  }

  const classes = store.get('classes');
  const classItem = classes.find(c => c.code.toUpperCase() === code.trim().toUpperCase());

  if (!classItem) {
    return res.status(404).json({ success: false, error: 'Invalid room code. Please check with your teacher.' });
  }

  const student = req.user;

  const studentsSet = new Set(classItem.studentIds || []);
  if (studentsSet.has(studentId)) {
    return res.json({ success: true, message: 'Already enrolled in this class', class: classItem });
  }

  studentsSet.add(studentId);
  const updatedClass = store.update('classes', classItem.id, { studentIds: Array.from(studentsSet) });

  const joinedSet = new Set(student.joinedClasses || []);
  joinedSet.add(classItem.id);
  store.update('users', studentId, { joinedClasses: Array.from(joinedSet) });

  // Award XP for joining class
  store.awardXP(studentId, 50, `Joined classroom: ${classItem.title}`);

  res.json({ success: true, message: `Successfully joined ${classItem.title}!`, class: updatedClass });
});

// Post announcement / Stream update
router.post('/:id/stream', verifyToken, (req, res) => {
  const { title, content, attachments = [] } = req.body;
  const authorId = req.user.id;
  const classItem = store.findById('classes', req.params.id);

  if (!classItem) {
    return res.status(404).json({ success: false, error: 'Class not found' });
  }

  const author = req.user;
  const newPost = {
    id: `post_${Date.now()}`,
    authorId,
    authorName: author ? author.name : 'Anonymous',
    authorAvatar: author ? author.avatar : '',
    authorRole: author ? author.role : 'student',
    title: title || 'Classroom Discussion',
    content,
    attachments,
    createdAt: new Date().toISOString(),
    reactions: {},
    comments: []
  };

  const stream = [newPost, ...(classItem.stream || [])];
  store.update('classes', classItem.id, { stream });

  // Award participation XP
  store.awardXP(authorId, 25, 'Posted in classroom stream');

  res.json({ success: true, post: newPost, stream });
});

// Add comment to post
router.post('/:classId/stream/:postId/comments', verifyToken, (req, res) => {
  const { content } = req.body;
  const authorId = req.user.id;
  const classItem = store.findById('classes', req.params.classId);

  if (!classItem) {
    return res.status(404).json({ success: false, error: 'Class not found' });
  }

  const author = req.user;
  const stream = classItem.stream || [];
  const post = stream.find(p => p.id === req.params.postId);

  if (!post) {
    return res.status(404).json({ success: false, error: 'Post not found' });
  }

  const comment = {
    id: `comm_${Date.now()}`,
    authorId,
    authorName: author ? author.name : 'Anonymous',
    authorAvatar: author ? author.avatar : '',
    content,
    createdAt: new Date().toISOString()
  };

  post.comments = [...(post.comments || []), comment];
  store.update('classes', classItem.id, { stream });

  store.awardXP(authorId, 15, 'Commented on classroom discussion');

  res.json({ success: true, comment, stream });
});

// React to post
router.post('/:classId/stream/:postId/react', verifyToken, (req, res) => {
  const { emoji } = req.body;
  const classItem = store.findById('classes', req.params.classId);

  if (!classItem) {
    return res.status(404).json({ success: false, error: 'Class not found' });
  }

  const stream = classItem.stream || [];
  const post = stream.find(p => p.id === req.params.postId);

  if (!post) {
    return res.status(404).json({ success: false, error: 'Post not found' });
  }

  post.reactions = post.reactions || {};
  post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;

  store.update('classes', classItem.id, { stream });
  res.json({ success: true, reactions: post.reactions });
});

// Bulk Enroll Students via CSV or email list (Teacher / Institute Tier)
router.post('/:id/bulk-enroll', verifyToken, requireTeacher, (req, res) => {
  const classItem = store.findById('classes', req.params.id);
  if (!classItem) {
    return res.status(404).json({ success: false, error: 'Class not found' });
  }

  // Verify ownership
  if (classItem.teacherId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Not authorized to manage this classroom roster.' });
  }

  const { students = [] } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ success: false, error: 'Please provide a list of students to enroll.' });
  }

  const existingUsers = store.get('users');
  const currentStudentIds = new Set(classItem.studentIds || []);
  let newlyEnrolledCount = 0;
  let newlyCreatedAccounts = 0;

  students.forEach(item => {
    const email = (typeof item === 'string' ? item : item.email || '').trim().toLowerCase();
    const name = (typeof item === 'object' && item.name ? item.name : email.split('@')[0] || 'Student').trim();
    if (!email) return;

    let user = existingUsers.find(u => u.email && u.email.toLowerCase() === email);

    if (!user) {
      // Create new student account with default temporary credentials
      const { salt, hash } = hashPassword('Welcome@123');
      const newUserId = `u_stu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      user = {
        id: newUserId,
        email,
        name,
        role: 'student',
        passwordSalt: salt,
        passwordHash: hash,
        gradeClass: classItem.gradeLevel || 'Grade 10',
        section: (item.section || 'A').toUpperCase(),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        xp: 100,
        level: 1,
        streak: 1,
        badges: ['Classroom Pioneer'],
        joinedClasses: [classItem.id],
        institute: classItem.institute || null,
        createdAt: new Date().toISOString()
      };
      store.insert('users', user);
      newlyCreatedAccounts++;
    } else {
      // Update joinedClasses if not present
      const joined = new Set(user.joinedClasses || []);
      if (!joined.has(classItem.id)) {
        joined.add(classItem.id);
        store.update('users', user.id, { joinedClasses: Array.from(joined) });
      }
    }

    if (!currentStudentIds.has(user.id)) {
      currentStudentIds.add(user.id);
      newlyEnrolledCount++;
    }
  });

  // Persist updated roster in class
  store.update('classes', classItem.id, { studentIds: Array.from(currentStudentIds) });

  // Get sanitized roster
  const allUsers = store.get('users');
  const updatedStudents = Array.from(currentStudentIds).map(sid => {
    const u = allUsers.find(user => user.id === sid);
    return u ? sanitizeUser(u, false) : { id: sid, name: 'Student', role: 'student' };
  });

  res.json({
    success: true,
    message: `Successfully enrolled ${newlyEnrolledCount} student(s) (${newlyCreatedAccounts} new accounts created).`,
    enrolledCount: newlyEnrolledCount,
    newlyCreatedAccounts,
    totalRosterCount: currentStudentIds.size,
    students: updatedStudents
  });
});

module.exports = router;
