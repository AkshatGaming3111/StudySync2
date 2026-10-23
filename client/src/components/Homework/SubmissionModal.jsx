import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import LaTeXRenderer from '../Common/LaTeXRenderer';
import {
  X,
  Send,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Clock
} from 'lucide-react';

export default function SubmissionModal({ assignment, isOpen, onClose, onSubmitted }) {
  const { currentUser, triggerXpGain } = useAuth();
  const [content, setContent] = useState('');
  const [precheckLoading, setPrecheckLoading] = useState(false);
  const [precheckResult, setPrecheckResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !assignment) return null;

  const handlePrecheck = async () => {
    if (!content.trim()) return;
    setPrecheckLoading(true);
    try {
      const res = await api.assignments.precheck(assignment.id, content.trim());
      if (res.success && res.feedback) {
        setPrecheckResult(res.feedback);
      }
    } catch (err) {
      console.error('Precheck error:', err);
    } finally {
      setPrecheckLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.assignments.submit(assignment.id, {
        studentId: currentUser?.id,
        content: content.trim()
      });

      if (res.success) {
        if (res.award) {
          triggerXpGain(res.award);
        }
        if (onSubmitted) onSubmitted(res.submission);
        onClose();
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-200 dark:border-dark-border flex items-center justify-between bg-gray-50/80 dark:bg-dark-surface/80">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              Interactive Submission Studio
            </span>
            <h3 className="font-bold text-base text-gray-900 dark:text-white mt-1">{assignment.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* Assignment Overview Box */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
                <Award className="w-4 h-4" /> {assignment.points} Points Max ({assignment.xpReward || 150} XP)
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-500" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            </div>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <LaTeXRenderer content={assignment.description} />
            </div>

            {/* Rubric Breakdown Accordion */}
            {assignment.rubric && assignment.rubric.length > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
                <p className="font-bold text-gray-900 dark:text-white mb-1.5">Evaluation Rubric:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {assignment.rubric.map((r, i) => (
                    <div key={i} className="p-2 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
                      <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200">
                        <span>{r.criterion}</span>
                        <span className="text-brand-500 font-mono">{r.maxPoints} pts</span>
                      </div>
                      {r.description && <p className="text-[11px] text-gray-400 mt-0.5">{r.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submission Input Box */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-500" /> Your Solution / Response
                </label>
                <span className="text-[11px] text-gray-400">Supports Markdown, LaTeX \\(x^2\\), and code blocks</span>
              </div>
              <textarea
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your explanation, code implementations, Big-O derivations, or mathematical solutions here..."
                required
                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
            </div>

            {/* AI Pre-Check Action Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-brand-500/10 to-indigo-500/10 border border-brand-500/20">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>Want instant feedback before submitting?</span>
              </div>
              <button
                type="button"
                onClick={handlePrecheck}
                disabled={!content.trim() || precheckLoading}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-dark-card hover:bg-gray-100 text-brand-600 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-800 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{precheckLoading ? 'Evaluating Clarity...' : 'Run AI Pre-Check'}</span>
              </button>
            </div>

            {/* Precheck Results Display */}
            {precheckResult && (
              <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-brand-500/30 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
                    <CheckCircle2 className="w-4 h-4" /> Pre-Check Status: {precheckResult.status}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                    Estimated Score: {precheckResult.scoreEstimate}
                  </span>
                </div>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300 pt-1">
                  {precheckResult.suggestions?.map((sug, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">💡</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Final Submission Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-teal-600 hover:from-brand-600 hover:to-teal-700 text-white font-bold shadow-md shadow-brand-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting & AI Grading...' : 'Submit Final Solution'}</span>
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
