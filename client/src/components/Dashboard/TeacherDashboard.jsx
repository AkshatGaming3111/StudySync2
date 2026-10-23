import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import { useCommercial } from '../../context/CommercialContext';
import { api } from '../../services/api';
import StatCard from '../Common/StatCard';
import {
  Sparkles,
  BookOpen,
  FileCheck2,
  Brain,
  PlusCircle,
  Hash,
  Users,
  PenTool,
  Bot,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  GraduationCap,
  Award,
  Zap,
  Building2,
  Upload
} from 'lucide-react';

export default function TeacherDashboard({
  setActiveTab,
  onOpenCreateClassModal,
  onOpenCreateAssignmentModal,
  onOpenQuizGenModal,
  onOpenAI
}) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { classes, activeClass, selectClass } = useClass();
  const { openBulkEnroll, openPricing } = useCommercial();

  const handleNavigate = (tab) => {
    const routeMap = {
      assignments: '/assignments',
      tests: '/arena',
      arena: '/arena',
      leaderboard: '/leaderboard',
      classroom: activeClass ? `/classes/${activeClass.id}/stream` : '/classes',
      whiteboard: activeClass ? `/classes/${activeClass.id}/whiteboard` : '/whiteboard',
      dashboard: '/dashboard'
    };
    navigate(routeMap[tab] || `/${tab}`);
    if (setActiveTab) setActiveTab(tab);
  };

  const [assignments, setAssignments] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const [asgRes, testRes] = await Promise.all([
          api.assignments.getAll({ teacherId: currentUser.id }),
          api.tests.getAll({ teacherId: currentUser.id })
        ]);
        if (asgRes.success) setAssignments(asgRes.assignments || []);
        if (testRes.success) setTests(testRes.tests || []);
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  // Compute total enrolled students across all created classes
  const totalStudents = classes.reduce((acc, c) => acc + (c.studentIds ? c.studentIds.length : 0), 0);
  const pendingGradingCount = assignments.reduce((acc, a) => {
    const subs = a.submissions || [];
    return acc + subs.filter(s => s.status !== 'graded').length;
  }, 0);

  return (
    <div className="relative space-y-6 text-xs font-sans">
      
      {/* Subtle Aurora Mesh Gradients behind teacher header */}
      <div className="absolute -top-16 -left-16 w-96 h-96 bg-gradient-to-tr from-brand-500/10 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-48 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Teacher Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-brand-700 text-white p-6 sm:p-8 shadow-xl border border-white/20 dark:shadow-specular">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-200" />
            <span>Teacher Faculty Console • {currentUser?.specialty || 'General STEM'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Welcome back, {currentUser?.name}! 🎓
          </h2>

          <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
            You are directing <strong className="text-white underline">{classes.length} active classrooms</strong> with <strong className="text-white">{totalStudents} enrolled students</strong>. AI Rubric Auto-Grading is ready to evaluate submissions in your queue.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-3">
            <button
              onClick={onOpenCreateAssignmentModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-indigo-700 font-extrabold shadow-md hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Create Assignment with Rubric</span>
            </button>

            <button
              onClick={onOpenQuizGenModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-950/80 text-white font-extrabold border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Brain className="w-4 h-4 text-brand-300" />
              <span>Generate AI Quiz / Test</span>
            </button>

            <button
              onClick={onOpenCreateClassModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-brand-900/60 hover:bg-brand-900/80 text-white font-extrabold border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-brand-300" />
              <span>New Classroom</span>
            </button>

            {classes.length > 0 && (
              <button
                onClick={() => openBulkEnroll(classes[0].id, classes[0].title)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500/80 hover:bg-indigo-500 text-white font-extrabold border border-indigo-300/30 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Upload className="w-4 h-4 text-white" />
                <span>Bulk Enroll Students (CSV)</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient Aurora Orbs inside Hero Card */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-brand-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-white/15 blur-3xl pointer-events-none" />
      </div>

      {/* Teacher Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Classrooms Managed"
          value={classes.length}
          subtitle="Virtual Rooms"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Total Enrolled Students"
          value={totalStudents}
          subtitle="Active Scholars"
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Assignments Created"
          value={assignments.length}
          subtitle="Rubric Evaluated"
          icon={FileCheck2}
          color="purple"
        />
        <StatCard
          title="Submissions to Grade"
          value={pendingGradingCount}
          subtitle="AI Rubric Ready"
          icon={Brain}
          color="amber"
        />
      </div>

      {/* Main Grid: Classrooms Managed & Submissions Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Managed Classrooms */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Your Created Classrooms ({classes.length})
            </h3>
            <button
              onClick={onOpenCreateClassModal}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Create New Class
            </button>
          </div>

          {classes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classes.map((c) => {
                const isSelected = activeClass?.id === c.id;
                const studentCount = c.studentIds ? c.studentIds.length : 0;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      selectClass(c);
                      navigate(`/classes/${c.id}/stream`);
                      if (setActiveTab) setActiveTab('classroom');
                    }}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-50/90 to-white dark:from-dark-card dark:to-dark-surface border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {c.subject}
                        </span>
                        <span className="font-mono font-bold text-[10px] text-brand-500 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800/40">
                          Room {c.code}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                        {c.title}
                      </h4>

                      <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1 font-semibold">
                        <Users className="w-3.5 h-3.5 text-gray-400" /> {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        Manage Stream <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-dashed border-gray-300 dark:border-white/10 bg-white/50 dark:bg-dark-card/50 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">No classrooms created yet</h4>
              <p className="text-gray-500 dark:text-gray-400 text-xs max-w-sm mx-auto">
                Create your first virtual classroom to generate a unique 6-character room code for your students.
              </p>
              <button
                onClick={onOpenCreateClassModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
              >
                Create First Classroom
              </button>
            </div>
          )}

          {/* Teacher Interactive Tools Suite */}
          <div className="pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">
              Faculty Teaching Suite
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleNavigate('whiteboard')}
                className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-amber-500 transition-all text-left space-y-1.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PenTool className="w-4 h-4" />
                </div>
                <p className="font-bold text-xs text-gray-900 dark:text-white">SyncBoard</p>
                <p className="text-[10px] text-gray-400">Interactive Canvas</p>
              </button>

              <button
                onClick={onOpenQuizGenModal}
                className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-purple-500 transition-all text-left space-y-1.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-4 h-4" />
                </div>
                <p className="font-bold text-xs text-gray-900 dark:text-white">AI Quiz Gen</p>
                <p className="text-[10px] text-gray-400">Custom Exam Maker</p>
              </button>

              <button
                onClick={() => handleNavigate('assignments')}
                className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-indigo-500 transition-all text-left space-y-1.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <p className="font-bold text-xs text-gray-900 dark:text-white">AI Auto-Grader</p>
                <p className="text-[10px] text-gray-400">Rubric Evaluation</p>
              </button>

              <button
                onClick={onOpenAI}
                className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-teal-500 transition-all text-left space-y-1.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bot className="w-4 h-4" />
                </div>
                <p className="font-bold text-xs text-gray-900 dark:text-white">Faculty AI</p>
                <p className="text-[10px] text-gray-400">Lesson Assistant</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Auto-Grading & Active Assignments */}
        <div className="space-y-4">
          
          {/* AI Rubric Tip */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">AI Auto-Grading Ready</h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xs">
              When reviewing student submissions in the Homework Studio, click <strong>"AI Auto-Grade with Rubric"</strong> to instantly score mathematical derivations and code proofs against your criteria.
            </p>
            <button
              onClick={() => handleNavigate('assignments')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Open Homework Grading Studio →
            </button>
          </div>

          {/* Active Assignments List */}
          <div className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-500" /> Active Assignments
              </h4>
              <button
                onClick={onOpenCreateAssignmentModal}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + New
              </button>
            </div>

            {assignments.length > 0 ? (
              <div className="space-y-2">
                {assignments.slice(0, 4).map((asg) => (
                  <div
                    key={asg.id}
                    onClick={() => handleNavigate('assignments')}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:border-indigo-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-900 dark:text-white truncate max-w-[180px]">{asg.title}</span>
                      <span className="text-indigo-500 font-mono font-bold text-[11px]">{asg.points} pts</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                      <span>Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                      <span className="font-bold text-indigo-500">
                        {(asg.submissions || []).length} Submissions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                No assignments created yet. Click "+ New" to assign homework.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
