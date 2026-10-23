import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LaTeXRenderer from '../Common/LaTeXRenderer';
import {
  X,
  Sparkles,
  Award,
  CheckCircle2,
  Edit3,
  Send,
  User,
  Clock,
  BookOpen
} from 'lucide-react';

export default function AIGradingModal({ submission, assignment, isOpen, onClose, onGraded }) {
  const [grade, setGrade] = useState(submission?.grade || submission?.aiSuggestedScore || 90);
  const [feedback, setFeedback] = useState(submission?.feedback || submission?.aiFeedback || '');
  const [rubricBreakdown, setRubricBreakdown] = useState(submission?.aiRubricBreakdown || []);
  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (submission) {
      setGrade(submission.grade !== null ? submission.grade : (submission.aiSuggestedScore || 90));
      setFeedback(submission.feedback || submission.aiFeedback || '');
      setRubricBreakdown(submission.aiRubricBreakdown || []);
    }
  }, [submission]);

  if (!isOpen || !submission || !assignment) return null;

  const handleTriggerAIGrade = async () => {
    setLoadingAI(true);
    try {
      const res = await api.assignments.aiGradeSubmission(submission.id);
      if (res.success && res.aiEval) {
        setGrade(res.aiEval.suggestedScore);
        setFeedback(res.aiEval.feedback);
        setRubricBreakdown(res.aiEval.rubricBreakdown);
      }
    } catch (err) {
      console.error('AI grading error:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleFinalize = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.assignments.finalizeGrade(submission.id, {
        grade: Number(grade),
        feedback,
        rubricBreakdown
      });

      if (res.success) {
        if (onGraded) onGraded(res.submission);
        onClose();
      }
    } catch (err) {
      console.error('Finalize grade error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-dark-border flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-gray-50/80 dark:bg-dark-surface/80">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={submission.studentAvatar}
              alt={submission.studentName}
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                Grade Submission: {submission.studentName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {assignment.title} • Submitted {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleTriggerAIGrade}
              disabled={loadingAI}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${loadingAI ? 'animate-spin' : ''}`} />
              <span>{loadingAI ? 'AI Grading...' : 'Run AI Auto-Grade'}</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view (Student Solution on Left, Rubric & Teacher Feedback on Right) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          
          {/* Left Column: Student Submission Content */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brand-500" /> Student Response
            </h4>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-800 dark:text-gray-200 overflow-x-auto min-h-[350px] leading-relaxed">
              <LaTeXRenderer content={submission.content} />
            </div>
          </div>

          {/* Right Column: AI Rubric Breakdown & Grade Form */}
          <form onSubmit={handleFinalize} className="space-y-4">
            
            {/* Score Points Input Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-transparent border border-brand-500/20 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">Final Awarded Score</p>
                <p className="text-[11px] text-gray-500">Max possible: {assignment.points} points</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  min="0"
                  max={assignment.points}
                  required
                  className="w-20 px-3 py-2 text-center text-lg font-black rounded-xl bg-white dark:bg-dark-card border border-brand-500 text-brand-600 dark:text-brand-400 font-mono focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-gray-400 font-bold">/ {assignment.points}</span>
              </div>
            </div>

            {/* Rubric Breakdown List */}
            {rubricBreakdown && rubricBreakdown.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-bold text-gray-900 dark:text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-brand-500" /> AI Rubric Evaluation
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {rubricBreakdown.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-900 dark:text-white">{r.criterion}</span>
                        <span className="text-brand-600 dark:text-brand-400 font-mono font-bold">
                          {r.score} / {r.maxScore} pts
                        </span>
                      </div>
                      {r.comment && <p className="text-[11px] text-gray-500 mt-1">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teacher Feedback textarea */}
            <div>
              <label className="block font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-brand-500" /> Feedback & Constructive Advice
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Personalized feedback for the student..."
                required
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Submit / Return Grade Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-700 hover:to-brand-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Returning Grade...' : 'Finalize & Return Grade to Student'}</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
