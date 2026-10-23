const express = require('express');
const router = express.Router();
const store = require('../data/store');
const aiEngine = require('../services/aiEngine');
const { verifyToken } = require('../middleware/auth');

// List tests (aligned with student's assigned class & CBSE curriculum)
router.get('/', (req, res) => {
  const { classId, studentId, gradeLevel } = req.query;
  let tests = store.get('tests');
  const classes = store.get('classes');
  let student = null;

  if (studentId) {
    student = store.findById('users', studentId);
  }

  // If studentId is provided, filter tests to match student's assigned grade/class or enrolled classes
  if (student && student.gradeClass) {
    const studentEnrolledClassIds = student.joinedClasses || [];
    tests = tests.filter(t => {
      // Matches student's explicit class ID or matches student's grade level
      return (
        (t.classId && studentEnrolledClassIds.includes(t.classId)) ||
        (t.gradeLevel && t.gradeLevel === student.gradeClass) ||
        (!t.classId && (!t.gradeLevel || t.gradeLevel === student.gradeClass))
      );
    });
  } else if (classId) {
    tests = tests.filter(t => t.classId === classId);
  } else if (gradeLevel) {
    tests = tests.filter(t => t.gradeLevel === gradeLevel);
  }

  // Populate student previous attempts and structured metadata
  const results = studentId ? store.get('testResults').filter(r => r.studentId === studentId) : [];
  tests = tests.map(t => {
    const classItem = classes.find(c => c.id === t.classId);
    const pastAttempt = studentId ? results.find(r => r.testId === t.id) : null;
    return {
      ...t,
      testName: t.title || 'Mastery Assessment',
      type: t.type || 'CBSE Board Examination Arena',
      date: t.date || t.createdAt || new Date().toISOString(),
      duration: `${t.timeLimitMinutes || 20} mins`,
      durationMinutes: t.timeLimitMinutes || 20,
      totalMarks: t.totalPoints || 100,
      className: classItem ? classItem.title : `CBSE ${t.gradeLevel || student?.gradeClass || 'Grade 10'} Arena`,
      subject: classItem ? classItem.subject : (t.subject || t.topic || 'General Science'),
      gradeLevel: t.gradeLevel || classItem?.gradeLevel || student?.gradeClass || 'Grade 10',
      pastAttempt: pastAttempt || null,
      attempted: !!pastAttempt,
      lastScore: pastAttempt ? pastAttempt.score : null,
      lastPercentage: pastAttempt ? pastAttempt.percentage : null
    };
  });

  res.json({ success: true, tests });
});

// Get single test with questions
router.get('/:id', (req, res) => {
  const test = store.findById('tests', req.params.id);
  if (!test) {
    return res.status(404).json({ success: false, error: 'Test not found' });
  }
  res.json({ success: true, test });
});

// AI Generate new Test (Authenticated Practice Arena on CBSE Syllabus)
router.post('/generate', verifyToken, async (req, res) => {
  const { topic, subject, gradeLevel, difficulty, questionCount, classId } = req.body;

  if (!topic) {
    return res.status(400).json({ success: false, error: 'Topic is required.' });
  }

  const apiKey = req.headers['x-gemini-key'] || req.body.apiKey || req.user?.geminiApiKey || '';

  try {
    const generated = await aiEngine.generateQuiz({
      topic,
      subject: subject || 'General',
      gradeLevel: gradeLevel || 'Grade 10',
      difficulty: difficulty || 'Medium',
      questionCount: parseInt(questionCount, 10) || 5,
      apiKey
    });

    if (classId) {
      generated.classId = classId;
    }
    generated.gradeLevel = gradeLevel || 'Grade 10';
    generated.subject = subject || generated.subject || 'Maths';

    store.insert('tests', generated);

    res.json({ success: true, test: generated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Submit Test & Calculate Results + Topic Breakdown + XP (Authenticated Student)
router.post('/:id/submit', verifyToken, (req, res) => {
  const { answers, timeSpentSeconds = 0 } = req.body;
  const studentId = req.user.id;
  const test = store.findById('tests', req.params.id);

  if (!test) {
    return res.status(404).json({ success: false, error: 'Test not found' });
  }

  const student = req.user;

  // Grade test
  const questions = test.questions || [];
  let correctCount = 0;
  const detailedAnswers = {};

  questions.forEach(q => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) correctCount++;
    detailedAnswers[q.id] = {
      selected: userAnswer,
      correct: q.correctAnswer,
      isCorrect,
      explanation: q.explanation
    };
  });

  const percentage = Math.round((correctCount / (questions.length || 1)) * 100);
  const earnedScore = Math.round((percentage / 100) * (test.totalPoints || 100));

  // Compute topic breakdown
  const topicBreakdown = {
    [test.topic || 'General Mastery']: percentage
  };

  let aiDiagnosis = '';
  if (percentage === 100) {
    aiDiagnosis = `Exceptional mastery! You achieved a perfect score on "${test.title}". Your conceptual intuition is sharp and accurate.`;
  } else if (percentage >= 80) {
    aiDiagnosis = `Strong performance! You demonstrated solid command over ${test.topic}. Review the detailed step-by-step explanations for the questions you missed to lock in full mastery.`;
  } else if (percentage >= 60) {
    aiDiagnosis = `Good effort! You grasp the fundamentals of ${test.topic}, but should review boundary conditions and asymptotic proofs before the final exam.`;
  } else {
    aiDiagnosis = `Recommended for review. We suggest reviewing the class lecture notes, practicing with the interactive flashcard deck, and asking StudyBot for step-by-step clarifications.`;
  }

  const resultRecord = {
    id: `res_${Date.now()}`,
    testId: test.id,
    testTitle: test.title,
    studentId,
    studentName: student.name,
    studentAvatar: student.avatar,
    score: earnedScore,
    totalPoints: test.totalPoints || 100,
    percentage,
    timeSpentSeconds,
    submittedAt: new Date().toISOString(),
    answers: answers,
    detailedAnswers,
    topicBreakdown,
    aiDiagnosis
  };

  store.insert('testResults', resultRecord);

  // Update student stats
  const currentStats = student.stats || {};
  const currentCompleted = (currentStats.quizzesCompleted || 0) + 1;
  const oldAvg = currentStats.averageQuizScore || 0;
  const newAvg = Number(((oldAvg * (currentCompleted - 1) + percentage) / currentCompleted).toFixed(1));

  store.update('users', studentId, {
    stats: {
      ...currentStats,
      quizzesCompleted: currentCompleted,
      averageQuizScore: newAvg
    }
  });

  // Award XP based on percentage and speed
  let xpAwarded = Math.round((percentage / 100) * (test.xpReward || 150));
  if (percentage === 100) xpAwarded += 50; // Perfect bonus
  if (timeSpentSeconds > 0 && timeSpentSeconds < 300 && percentage >= 80) {
    xpAwarded += 30; // Speed bonus
  }

  const awardResult = store.awardXP(studentId, xpAwarded, `Completed Exam Arena: ${test.title} (${percentage}%)`);

  // Check achievements (Perfect score, Speed demon)
  const badges = new Set(student.badges || []);
  if (percentage === 100 && !badges.has('b_perfect_score')) {
    badges.add('b_perfect_score');
  }
  if (timeSpentSeconds > 0 && timeSpentSeconds < 300 && percentage >= 90 && !badges.has('b_speed_demon')) {
    badges.add('b_speed_demon');
  }
  store.update('users', studentId, { badges: Array.from(badges) });

  res.json({
    success: true,
    result: resultRecord,
    award: awardResult
  });
});

// Get results for student or test
router.get('/results/student/:studentId', (req, res) => {
  const results = store.get('testResults').filter(r => r.studentId === req.params.studentId);
  res.json({ success: true, results });
});

router.get('/:id/results', (req, res) => {
  const results = store.get('testResults').filter(r => r.testId === req.params.id);
  res.json({ success: true, results });
});

module.exports = router;
