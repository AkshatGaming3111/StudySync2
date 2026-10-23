const express = require('express');
const router = express.Router();
const store = require('../data/store');
const aiEngine = require('../services/aiEngine');
const { verifyToken, requireTeacher } = require('../middleware/auth');

// List assignments
router.get('/', (req, res) => {
  const { classId, studentId } = req.query;
  let assignments = store.get('assignments');
  const classes = store.get('classes');

  if (classId) {
    assignments = assignments.filter(a => a.classId === classId);
  }

  // Populate submission status and class details
  const submissions = studentId ? store.get('submissions').filter(s => s.studentId === studentId) : [];

  assignments = assignments.map(asg => {
    const classItem = classes.find(c => c.id === asg.classId);
    const sub = studentId ? submissions.find(s => s.assignmentId === asg.id) : null;
    return {
      ...asg,
      className: classItem ? classItem.title : 'General Class',
      subject: classItem ? classItem.subject : 'General STEM',
      classCode: classItem ? classItem.code : '',
      userSubmission: sub || null,
      status: sub ? (sub.status === 'graded' ? 'graded' : 'submitted') : 'pending'
    };
  });

  res.json({ success: true, assignments });
});

// Get single assignment
router.get('/:id', (req, res) => {
  const assignment = store.findById('assignments', req.params.id);
  if (!assignment) {
    return res.status(404).json({ success: false, error: 'Assignment not found' });
  }

  const submissions = store.get('submissions').filter(s => s.assignmentId === assignment.id);
  const classItem = store.findById('classes', assignment.classId);

  res.json({
    success: true,
    assignment,
    class: classItem,
    submissions
  });
});

// Create new assignment (Teacher only: verified token and role check)
router.post('/', verifyToken, requireTeacher, (req, res) => {
  const { classId, title, description, dueDate, points, rubric, allowAIPrecheck, autoAIGrading } = req.body;

  if (!classId || !title || !description) {
    return res.status(400).json({ success: false, error: 'ClassId, title, and description are required.' });
  }

  const newAssignment = {
    id: `asg_${Date.now()}`,
    classId,
    title,
    description,
    dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    points: parseInt(points, 10) || 100,
    xpReward: Math.round((parseInt(points, 10) || 100) * 1.5),
    rubric: rubric && rubric.length > 0 ? rubric : [
      { criterion: "Conceptual Mastery", maxPoints: 40, description: "Accuracy of core principles" },
      { criterion: "Analysis & Proof", maxPoints: 30, description: "Depth of logical steps" },
      { criterion: "Clarity & Presentation", maxPoints: 30, description: "Structured markdown / syntax" }
    ],
    allowAIPrecheck: allowAIPrecheck !== false,
    autoAIGrading: autoAIGrading !== false,
    submissionsCount: 0,
    gradedCount: 0,
    createdAt: new Date().toISOString()
  };

  store.insert('assignments', newAssignment);

  // Auto-post to classroom stream
  const classItem = store.findById('classes', classId);
  if (classItem) {
    const newStreamPost = {
      id: `post_asg_${Date.now()}`,
      authorId: classItem.teacherId,
      authorName: classItem.teacherName,
      authorAvatar: classItem.teacherAvatar,
      authorRole: 'teacher',
      title: `📝 New Assignment: ${title}`,
      content: `A new assignment has been assigned with ${newAssignment.points} total points. Due date: ${new Date(newAssignment.dueDate).toLocaleDateString()}.\n\n${description}`,
      attachments: [{ type: 'assignment', name: title, id: newAssignment.id }],
      createdAt: new Date().toISOString(),
      reactions: { '📚': 5, '💪': 8 },
      comments: []
    };
    store.update('classes', classId, {
      stream: [newStreamPost, ...(classItem.stream || [])]
    });
  }

  res.json({ success: true, assignment: newAssignment });
});

// Student AI Pre-check
router.post('/precheck', async (req, res) => {
  const { assignmentId, submissionText } = req.body;
  const assignment = store.findById('assignments', assignmentId);

  if (!assignment) {
    return res.status(404).json({ success: false, error: 'Assignment not found' });
  }

  const apiKey = req.headers['x-gemini-key'] || req.body.apiKey || '';

  try {
    const feedback = await aiEngine.precheckSubmission({
      assignment,
      submissionText: submissionText || '',
      apiKey
    });
    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Student submit assignment (Authenticated student)
router.post('/:id/submit', verifyToken, async (req, res) => {
  const { content, attachments = [] } = req.body;
  const studentId = req.user.id;
  const assignment = store.findById('assignments', req.params.id);

  if (!assignment) {
    return res.status(404).json({ success: false, error: 'Assignment not found' });
  }

  const student = req.user;
  const apiKey = req.headers['x-gemini-key'] || req.body.apiKey || req.user?.geminiApiKey || '';

  const existingSubmissions = store.get('submissions');
  const existingIndex = existingSubmissions.findIndex(
    s => s.assignmentId === assignment.id && s.studentId === studentId
  );

  // Run instant AI auto-grading evaluation
  let aiEval = null;
  if (assignment.autoAIGrading) {
    try {
      aiEval = await aiEngine.autoGradeSubmission({
        assignment,
        submissionText: content,
        apiKey
      });
    } catch (e) {
      console.warn('Auto grading failed:', e);
    }
  }

  const newSubmission = {
    id: existingIndex !== -1 ? existingSubmissions[existingIndex].id : `sub_${Date.now()}`,
    assignmentId: assignment.id,
    studentId,
    studentName: student.name,
    studentAvatar: student.avatar,
    submittedAt: new Date().toISOString(),
    status: 'submitted', // submitted or graded
    content,
    attachments,
    grade: aiEval ? aiEval.suggestedScore : null,
    feedback: aiEval ? aiEval.feedback : null,
    aiSuggestedScore: aiEval ? aiEval.suggestedScore : null,
    aiRubricBreakdown: aiEval ? aiEval.rubricBreakdown : [],
    aiFeedback: aiEval ? aiEval.feedback : ''
  };

  if (existingIndex !== -1) {
    store.update('submissions', newSubmission.id, newSubmission);
  } else {
    store.insert('submissions', newSubmission);
    store.update('assignments', assignment.id, {
      submissionsCount: (assignment.submissionsCount || 0) + 1
    });
  }

  // Award submission XP
  const xpReward = assignment.xpReward || 100;
  const awardResult = store.awardXP(studentId, xpReward, `Submitted assignment: ${assignment.title}`);

  res.json({
    success: true,
    submission: newSubmission,
    award: awardResult
  });
});

// Trigger AI auto-grade for a specific submission (Authenticated)
router.post('/submissions/:id/ai-grade', verifyToken, async (req, res) => {
  const submission = store.findById('submissions', req.params.id);
  if (!submission) {
    return res.status(404).json({ success: false, error: 'Submission not found' });
  }

  const assignment = store.findById('assignments', submission.assignmentId);
  if (!assignment) {
    return res.status(404).json({ success: false, error: 'Assignment not found' });
  }

  const apiKey = req.headers['x-gemini-key'] || req.body.apiKey || req.user?.geminiApiKey || '';

  try {
    const aiEval = await aiEngine.autoGradeSubmission({
      assignment,
      submissionText: submission.content,
      apiKey
    });

    const updated = store.update('submissions', submission.id, {
      aiSuggestedScore: aiEval.suggestedScore,
      aiRubricBreakdown: aiEval.rubricBreakdown,
      aiFeedback: aiEval.feedback
    });

    res.json({ success: true, submission: updated, aiEval });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Teacher finalize grade & return feedback (Teacher only: verified token & role check)
router.post('/submissions/:id/grade', verifyToken, requireTeacher, (req, res) => {
  const { grade, feedback, rubricBreakdown } = req.body;
  const submission = store.findById('submissions', req.params.id);

  if (!submission) {
    return res.status(404).json({ success: false, error: 'Submission not found' });
  }

  const assignment = store.findById('assignments', submission.assignmentId);
  const wasGradedBefore = submission.status === 'graded';

  const updated = store.update('submissions', submission.id, {
    grade: Number(grade),
    feedback,
    aiRubricBreakdown: rubricBreakdown || submission.aiRubricBreakdown,
    status: 'graded',
    gradedAt: new Date().toISOString()
  });

  if (!wasGradedBefore && assignment) {
    store.update('assignments', assignment.id, {
      gradedCount: (assignment.gradedCount || 0) + 1
    });
  }

  // If score is 100%, unlock perfect score badge
  if (Number(grade) >= (assignment ? assignment.points : 100)) {
    const student = store.findById('users', submission.studentId);
    if (student) {
      const badges = new Set(student.badges || []);
      badges.add('b_perfect_score');
      store.update('users', student.id, { badges: Array.from(badges) });
    }
  }

  res.json({ success: true, submission: updated });
});

module.exports = router;
