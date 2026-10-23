import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import LaTeXRenderer from '../Common/LaTeXRenderer';
import {
  Timer,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

export default function LiveExamModal({ test, isOpen, onClose, onFinish }) {
  const { currentUser, triggerXpGain } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState((test?.timeLimitMinutes || 15) * 60);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  useEffect(() => {
    if (!isOpen || !test) return;
    setSecondsRemaining((test.timeLimitMinutes || 15) * 60);
    setAnswers({});
    setFlagged(new Set());
    setCurrentIndex(0);
  }, [isOpen, test]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || secondsRemaining <= 0 || submitting) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, secondsRemaining, submitting]);

  if (!isOpen || !test) return null;

  const questions = test.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optIndex
    }));
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  const handleAutoSubmit = () => {
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    setSubmitting(true);
    const timeSpent = (test.timeLimitMinutes || 15) * 60 - secondsRemaining;
    try {
      const res = await api.tests.submit(test.id, {
        studentId: currentUser?.id,
        answers,
        timeSpentSeconds: Math.max(1, timeSpent)
      });

      if (res.success && res.result) {
        if (res.award) {
          triggerXpGain(res.award);
        }
        if (onFinish) onFinish(res.result);
      }
    } catch (err) {
      console.error('Failed to submit test:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[94vh] sm:h-[90vh]">
        
        {/* Header Bar */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between gap-2 sm:gap-4 bg-gray-50/90 dark:bg-dark-surface/90 backdrop-blur-md">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Exam Arena Simulator
            </span>
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white mt-0.5 truncate">
              {test.title}
            </h3>
          </div>

          {/* Countdown Timer & Submit */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl font-mono font-bold text-xs sm:text-sm border shadow-sm ${
              secondsRemaining < 120
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-800 dark:text-gray-200'
            }`}>
              <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => setConfirmSubmit(true)}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Question Area & Navigator Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-dark-border">
          
          {/* Main Question Column (3 cols) */}
          <div className="p-6 md:col-span-3 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    flagged.has(currentQuestion?.id)
                      ? 'bg-amber-50 dark:bg-amber-950 border-amber-400 text-amber-600 dark:text-amber-400 font-bold'
                      : 'border-gray-200 dark:border-dark-border text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{flagged.has(currentQuestion?.id) ? 'Flagged for Review' : 'Flag Question'}</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                <LaTeXRenderer content={currentQuestion?.question} />
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQuestion?.options?.map((opt, optIdx) => {
                  const isSelected = answers[currentQuestion.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-3.5 sm:p-4 min-h-[48px] rounded-2xl border text-xs font-medium transition-all active:scale-[0.99] flex items-start gap-3 ${
                        isSelected
                          ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-900 dark:text-brand-100 shadow-sm ring-1 ring-brand-500'
                          : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-brand-500 text-white'
                          : 'bg-gray-100 dark:bg-dark-card text-gray-500'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <div className="flex-1 leading-relaxed">
                        <LaTeXRenderer content={opt} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prev / Next Navigation Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={() => {
                  if (currentIndex < totalQuestions - 1) {
                    setCurrentIndex(prev => prev + 1);
                  } else {
                    setConfirmSubmit(true);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5"
              >
                <span>{currentIndex === totalQuestions - 1 ? 'Review & Submit' : 'Next Question'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Question Navigator Grid (1 col) */}
          <div className="p-4 space-y-4 bg-gray-50/50 dark:bg-dark-surface/50">
            <div>
              <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider mb-1">
                Question Grid
              </h4>
              <p className="text-[11px] text-gray-500">
                {answeredCount} of {totalQuestions} Answered
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                const isFlagged = flagged.has(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-10 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-brand-500 bg-brand-500 text-white'
                        : isAnswered
                        ? 'bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-800'
                        : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-1.5 pt-3 border-t border-gray-200 dark:border-dark-border text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-brand-500" /> Current Question
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-brand-100 dark:bg-brand-950 border border-brand-400" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> Flagged for Review
              </div>
            </div>
          </div>

        </div>

        {/* Confirmation Modal Overlay */}
        {confirmSubmit && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 rounded-3xl shadow-2xl text-center space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-gray-900 dark:text-white">Ready to Submit?</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You have answered <strong>{answeredCount} of {totalQuestions}</strong> questions.
                  {totalQuestions - answeredCount > 0 && ` (${totalQuestions - answeredCount} unanswered)`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmSubmit(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border font-semibold text-xs text-gray-700 dark:text-gray-300"
                >
                  Return to Exam
                </button>
                <button
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md"
                >
                  {submitting ? 'Evaluating...' : 'Confirm Submission'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
