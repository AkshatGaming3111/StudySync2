import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClass } from '../context/ClassContext';
import { api } from '../services/api';
import QuizGeneratorModal from '../components/Testing/QuizGeneratorModal';
import LiveExamModal from '../components/Testing/LiveExamModal';
import TestResultModal from '../components/Testing/TestResultModal';
import LaTeXRenderer from '../components/Common/LaTeXRenderer';
import {
  Brain,
  Sparkles,
  Timer,
  Award,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  Trophy,
  BookOpen,
  Clock
} from 'lucide-react';

export default function TestsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isTeacher, isStudent } = useAuth();
  const { activeClass } = useClass();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showGenModal, setShowGenModal] = useState(false);
  const [activeExamTest, setActiveExamTest] = useState(null);
  const [activeResult, setActiveResult] = useState(null);
  const [activeResultTest, setActiveResultTest] = useState(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.tests.getAll({
        studentId: isStudent ? currentUser?.id : undefined
      });
      if (res.success) {
        setTests(res.tests);
      }
    } catch (e) {
      console.error('Failed to load tests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [currentUser]);

  // Auto start test if testId is in the route
  useEffect(() => {
    if (testId && tests.length > 0) {
      const found = tests.find(t => t.id === testId);
      if (found && !activeExamTest) {
        setActiveExamTest(found);
      }
    }
  }, [testId, tests]);

  const handleStartExam = (test) => {
    navigate(`/arena/${test.id}`);
    setActiveExamTest(test);
  };

  const handleExamFinished = (result) => {
    const test = activeExamTest;
    setActiveExamTest(null);
    setActiveResult(result);
    setActiveResultTest(test);
    fetchTests();
  };

  return (
    <div className="relative space-y-6 text-xs">
      
      {/* Aurora Ambient Mesh Glows */}
      <div className="absolute -top-16 -left-16 w-96 h-96 bg-gradient-to-tr from-purple-500/12 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-brand-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200/80 dark:border-white/10 shadow-sm dark:shadow-specular flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" /> AI Examination Arena & Quizzes
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            Test conceptual retention under timed exam conditions with instant AI diagnostic breakdown and XP rewards
          </p>
        </div>

        <button
          onClick={() => setShowGenModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 transition-transform flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate AI Test Arena</span>
        </button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test) => {
          const pastAttempt = test.pastAttempt;
          const questionsCount = test.questions?.length || 5;

          return (
            <div
              key={test.id}
              className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {test.topic || 'Mastery Assessment'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-surface text-gray-500">
                    {test.difficulty || 'Medium'}
                  </span>
                </div>

                <h4 className="font-bold text-base text-gray-900 dark:text-white">{test.title}</h4>

                <div className="flex flex-wrap items-center gap-4 text-gray-500 text-xs">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-brand-500" /> {test.timeLimitMinutes || 15} Mins
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> {questionsCount} Questions
                  </span>
                  <span className="flex items-center gap-1 font-bold text-amber-500">
                    <Zap className="w-3.5 h-3.5 fill-amber-500" /> +{test.xpReward || 200} XP
                  </span>
                </div>
              </div>

              {/* Past score badge or start test button */}
              <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                {pastAttempt ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs border border-emerald-500/30">
                      Best Score: {pastAttempt.percentage}% ({pastAttempt.score} pts)
                    </span>
                    <button
                      onClick={() => {
                        setActiveResult(pastAttempt);
                        setActiveResultTest(test);
                      }}
                      className="text-brand-600 dark:text-brand-400 font-bold text-xs hover:underline"
                    >
                      View Breakdown
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">Not yet attempted</span>
                )}

                <button
                  onClick={() => handleStartExam(test)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-transform flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{pastAttempt ? 'Retake Exam' : 'Start Exam'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz Generator Modal */}
      {showGenModal && (
        <QuizGeneratorModal
          isOpen={showGenModal}
          onClose={() => setShowGenModal(false)}
          onGenerated={(newTest) => {
            fetchTests();
            handleStartExam(newTest);
          }}
        />
      )}

      {/* Timed Live Exam Arena */}
      {activeExamTest && (
        <LiveExamModal
          test={activeExamTest}
          isOpen={!!activeExamTest}
          onClose={() => {
            setActiveExamTest(null);
            if (testId) navigate('/arena', { replace: true });
          }}
          onFinish={(result) => {
            handleExamFinished(result);
            if (testId) navigate('/arena', { replace: true });
          }}
        />
      )}

      {/* Test Diagnostic & Result Breakdown */}
      {activeResult && (
        <TestResultModal
          result={activeResult}
          test={activeResultTest}
          isOpen={!!activeResult}
          onClose={() => setActiveResult(null)}
          onRetake={() => {
            const t = activeResultTest;
            setActiveResult(null);
            handleStartExam(t);
          }}
        />
      )}

    </div>
  );
}
