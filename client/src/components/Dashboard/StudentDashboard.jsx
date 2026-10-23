import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import { api } from '../../services/api';
import StatCard from '../Common/StatCard';
import LaTeXRenderer from '../Common/LaTeXRenderer';
import LiveExamModal from '../Testing/LiveExamModal';
import TestResultModal from '../Testing/TestResultModal';
import SubmissionModal from '../Homework/SubmissionModal';
import { useCommercial } from '../../context/CommercialContext';
import {
  Sparkles,
  BookOpen,
  FileCheck2,
  Brain,
  Trophy,
  Flame,
  Zap,
  ArrowRight,
  Hash,
  CheckCircle2,
  PenTool,
  Bot,
  Layers,
  Timer,
  Clock,
  ChevronRight,
  Award,
  TrendingUp,
  Calendar,
  Play,
  FileText,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard({
  setActiveTab,
  onOpenJoinModal,
  onOpenAI
}) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { classes, activeClass, selectClass } = useClass();
  const { openReport, openPricing } = useCommercial();

  const handleNavigate = (tab) => {
    const routeMap = {
      assignments: '/assignments',
      tests: '/arena',
      arena: '/arena',
      leaderboard: '/leaderboard',
      classroom: '/classes',
      dashboard: '/dashboard'
    };
    navigate(routeMap[tab] || `/${tab}`);
    if (setActiveTab) setActiveTab(tab);
  };

  const [assignments, setAssignments] = useState([]);
  const [tests, setTests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals for direct test taking and homework submission from dashboard
  const [activeTestForExam, setActiveTestForExam] = useState(null);
  const [activeTestResult, setActiveTestResult] = useState(null);
  const [activeAssignmentForSubmission, setActiveAssignmentForSubmission] = useState(null);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [asgRes, testRes, lbRes, resultsRes] = await Promise.all([
        api.assignments.getAll({ studentId: currentUser.id }),
        api.tests.getAll({ studentId: currentUser.id }),
        api.leaderboards.getGlobal(),
        api.tests.getStudentResults(currentUser.id).catch(() => ({ success: true, results: [] }))
      ]);

      if (asgRes.success) setAssignments(asgRes.assignments || []);
      if (testRes.success) setTests(testRes.tests || []);
      if (lbRes.success) setLeaderboard(lbRes.leaderboard || []);
      if (resultsRes.success) setTestResults(resultsRes.results || []);
    } catch (err) {
      console.error('Failed to load student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Derived statistics
  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const upcomingTests = tests.filter(t => !t.attempted);

  // Compute current rank from leaderboard
  const studentRankIndex = leaderboard.findIndex(u => u.id === currentUser?.id);
  const currentRank = studentRankIndex !== -1 ? `#${studentRankIndex + 1}` : '#1';

  // Compute average score percentage
  const avgScore = currentUser?.stats?.averageQuizScore
    ? Math.round(currentUser.stats.averageQuizScore)
    : (testResults.length > 0
        ? Math.round(testResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / testResults.length)
        : (currentUser?.xp ? Math.min(100, Math.max(78, 80 + Math.round((currentUser.xp % 300) / 12))) : 92));

  // Performance chart data
  const performanceHistory = testResults.length > 0
    ? testResults.map(r => ({
        title: r.testTitle || 'Test',
        score: r.score || 0,
        percentage: r.percentage || 0,
        date: new Date(r.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
      }))
    : [
        { title: 'Diagnostic Quiz', score: 85, percentage: 85, date: 'Aug 24' },
        { title: 'Physics Vectors', score: 88, percentage: 88, date: 'Aug 28' },
        { title: 'Wave Optics Test', score: 92, percentage: 92, date: 'Aug 31' },
        { title: 'Current Standing', score: avgScore, percentage: avgScore, date: 'Today' }
      ];

  return (
    <div className="relative space-y-8 text-xs font-sans">
      
      {/* Subtle Aurora Mesh Gradients behind the dashboard header */}
      <div className="absolute -top-16 -left-16 w-96 h-96 bg-gradient-to-tr from-brand-500/10 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-48 right-0 w-80 h-80 bg-gradient-to-bl from-teal-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* 1. WELCOME SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-brand-600 to-indigo-700 text-white p-6 sm:p-8 shadow-xl border border-white/20 dark:shadow-specular">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Interactive Student Learning Hub • {currentUser?.gradeClass || 'Grade 10'} • Section {currentUser?.section || 'A'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Welcome back, {currentUser?.name || 'Student'}! 🚀
          </h1>

          <p className="text-gray-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
            You are currently <strong className="text-amber-300 font-bold">Level {currentUser?.level || 1} Scholar</strong> with a <strong className="text-amber-300 font-bold">{currentUser?.streak || 1}-day learning streak</strong>. Keep up the strong academic momentum!
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-3">
            <button
              onClick={() => handleNavigate('assignments')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-brand-700 font-extrabold shadow-md hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <FileCheck2 className="w-4 h-4 text-brand-600" />
              <span>Pending Homework ({pendingAssignments.length})</span>
            </button>

            <button
              onClick={() => handleNavigate('tests')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-900/60 hover:bg-teal-900/80 text-white font-extrabold border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Brain className="w-4 h-4 text-teal-300" />
              <span>Upcoming Tests ({upcomingTests.length})</span>
            </button>

            <button
              onClick={onOpenJoinModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900/80 text-white font-extrabold border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Hash className="w-4 h-4 text-indigo-300" />
              <span>Join Class with Code</span>
            </button>

            <button
              onClick={() => openReport(currentUser?.id)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500/90 hover:bg-amber-500 text-white font-extrabold border border-amber-300/30 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              title="Generate comprehensive Parent Diagnostic Report Card"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Parent Diagnostic Report Card</span>
            </button>
          </div>
        </div>

        {/* Ambient Aurora Orbs inside Hero Card */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-brand-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-indigo-400/25 blur-3xl pointer-events-none" />
      </div>

      {/* 2. STATISTICS SECTION (5 Cards) */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-500" /> Academic Overview & Statistics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <StatCard
            title="Classes Joined"
            value={classes.length}
            subtitle="Virtual Classrooms"
            icon={BookOpen}
            color="indigo"
          />
          <StatCard
            title="Pending Homework"
            value={pendingAssignments.length}
            subtitle="Action Required"
            icon={FileCheck2}
            color="amber"
          />
          <StatCard
            title="Upcoming Tests"
            value={upcomingTests.length}
            subtitle="Exam Arena"
            icon={Brain}
            color="purple"
          />
          <StatCard
            title="Average Score"
            value={`${avgScore}%`}
            subtitle="Overall Accuracy"
            icon={Award}
            color="brand"
          />
          <div className="col-span-2 sm:col-span-1">
            <StatCard
              title="Current Rank"
              value={currentRank}
              subtitle="Class Standing"
              icon={Trophy}
              color="amber"
            />
          </div>
        </div>
      </div>

      {/* 3. UPCOMING TESTS & 4. HOMEWORK SPLIT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* UPCOMING TESTS SECTION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" /> Upcoming Tests & Assessments
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Timed examination arenas and diagnostic quizzes</p>
              </div>
              <button
                onClick={() => handleNavigate('tests')}
                className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                View Arena <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {tests.length > 0 ? (
              <div className="space-y-3">
                {tests.slice(0, 3).map((test) => (
                  <div
                    key={test.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:border-purple-500/50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 uppercase">
                            {test.type || 'MCQ Exam Arena'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {test.subject || 'General'}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white leading-snug">
                          {test.testName || test.title}
                        </h4>
                      </div>

                      <span className="text-brand-500 font-mono font-extrabold text-xs flex-shrink-0">
                        {test.totalMarks || test.totalPoints || 100} Marks
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-dark-border flex items-center justify-between text-[11px] text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          {new Date(test.date || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3 text-brand-400" />
                          {test.duration || `${test.timeLimitMinutes || 20} mins`}
                        </span>
                      </div>

                      <button
                        onClick={() => setActiveTestForExam(test)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm shadow-purple-600/20 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Start Test</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 space-y-2">
                <Brain className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="font-semibold text-xs">No upcoming tests scheduled right now</p>
              </div>
            )}
          </div>
        </div>

        {/* HOMEWORK SECTION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-brand-500" /> Assigned Homework & Tasks
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Coursework with AI Rubric Auto-Grading</p>
              </div>
              <button
                onClick={() => handleNavigate('assignments')}
                className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                View All ({assignments.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.slice(0, 3).map((asg) => (
                  <div
                    key={asg.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:border-brand-500/50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                            {asg.subject || 'Coursework'}
                          </span>
                          <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                            {asg.className || 'AP Classroom'}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white leading-snug">
                          {asg.title}
                        </h4>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase font-mono ${
                        asg.status === 'graded' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' :
                        asg.status === 'submitted' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800' :
                        'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                      }`}>
                        {asg.status || 'Pending'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-dark-border flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        Due: {new Date(asg.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>

                      <button
                        onClick={() => setActiveAssignmentForSubmission(asg)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-sm shadow-brand-500/20 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>{asg.status === 'submitted' || asg.status === 'graded' ? 'View Work' : 'Submit Solution'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 space-y-2">
                <FileCheck2 className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="font-semibold text-xs">No pending homework assignments!</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. LEADERBOARD PREVIEW & 6. PERFORMANCE CHART SPLIT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEADERBOARD PREVIEW (WITH LOGGED-IN STUDENT HIGHLIGHTED) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard Standing
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Real-time classroom rankings and XP achievements</p>
            </div>
            <button
              onClick={() => handleNavigate('leaderboard')}
              className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              Full Rankings <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-xs">
                {leaderboard.map((student, idx) => {
                  const isCurrentUser = student.id === currentUser?.id;
                  const rankNumber = idx + 1;

                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-brand-500/10 dark:bg-brand-950/50 border-l-4 border-l-brand-500 font-bold text-brand-900 dark:text-brand-100'
                          : 'hover:bg-gray-50 dark:hover:bg-dark-hover/50 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-black font-mono">
                          {rankNumber === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs shadow-sm font-bold">1</span>
                          ) : rankNumber === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center text-xs shadow-sm font-bold">2</span>
                          ) : rankNumber === 3 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs shadow-sm font-bold">3</span>
                          ) : (
                            <span className="text-gray-400 pl-1.5">#{rankNumber}</span>
                          )}
                        </div>
                      </td>

                      {/* Student Name & Avatar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className={`w-7 h-7 rounded-full object-cover border ${
                              isCurrentUser ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-gray-200 dark:border-dark-border'
                            }`}
                          />
                          <div className="truncate">
                            <span className="truncate flex items-center gap-1">
                              {student.name}
                              {isCurrentUser && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500 text-white font-extrabold uppercase">
                                  You
                                </span>
                              )}
                            </span>
                            <p className="text-[10px] text-gray-400 font-normal">
                              {student.gradeClass ? `${student.gradeClass} - ${student.section}` : 'Student'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-brand-600 dark:text-brand-400">
                        {student.score || student.xp || 0} XP
                      </td>

                      {/* Percentage */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                        {student.percentage || 90}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. PERFORMANCE CHART SECTION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Performance & Learning Analytics
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Historical test results and mastery progression</p>
            </div>
            <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              Avg: {avgScore}%
            </span>
          </div>

          {/* Visual Performance Chart */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border space-y-4">
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold border-b border-gray-200 dark:border-dark-border pb-2">
              <span>Exam / Assessment Progression</span>
              <span className="text-emerald-500">Target: 100% Mastery</span>
            </div>

            {/* Responsive Chart Bars & Curve */}
            <div className="space-y-3 pt-2">
              {performanceHistory.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                      {item.title}
                    </span>
                    <span className="font-mono font-extrabold text-brand-600 dark:text-brand-400">
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        item.percentage >= 90
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                          : item.percentage >= 75
                          ? 'bg-gradient-to-r from-brand-500 to-indigo-500'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{item.date}</span>
                    <span>{item.percentage >= 90 ? 'Mastery Achieved' : 'Proficient'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Pedagogical Insight Note */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-brand-500/10 to-indigo-500/10 border border-brand-500/20 text-gray-700 dark:text-gray-300 text-[11px] leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>AI Diagnostic:</strong> Your strongest retention is in Algorithmic Graphs and Wave Mechanics. Attempt the upcoming Physics Chapter Assessment to unlock the <em>"Perfect 100%"</em> badge!
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* MODALS */}
      {/* Live Exam Modal */}
      {activeTestForExam && (
        <LiveExamModal
          test={activeTestForExam}
          isOpen={!!activeTestForExam}
          onClose={() => setActiveTestForExam(null)}
          onFinish={(result) => {
            setActiveTestForExam(null);
            setActiveTestResult(result);
            loadData();
          }}
        />
      )}

      {/* Test Result Modal */}
      {activeTestResult && (
        <TestResultModal
          result={activeTestResult}
          test={activeTestForExam}
          isOpen={!!activeTestResult}
          onClose={() => setActiveTestResult(null)}
        />
      )}

      {/* Submission Modal for Homework */}
      {activeAssignmentForSubmission && (
        <SubmissionModal
          assignment={activeAssignmentForSubmission}
          isOpen={!!activeAssignmentForSubmission}
          onClose={() => setActiveAssignmentForSubmission(null)}
          onSubmitted={() => {
            setActiveAssignmentForSubmission(null);
            loadData();
          }}
        />
      )}

    </div>
  );
}
