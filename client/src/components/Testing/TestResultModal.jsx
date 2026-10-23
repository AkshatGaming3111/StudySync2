import React from 'react';
import ConfettiCelebration from '../Common/ConfettiCelebration';
import LaTeXRenderer from '../Common/LaTeXRenderer';
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  RotateCcw,
  X,
  BookOpen
} from 'lucide-react';

export default function TestResultModal({ result, test, isOpen, onClose, onRetake }) {
  if (!isOpen || !result) return null;

  const percentage = result.percentage || 0;
  const isGreat = percentage >= 80;
  const isPerfect = percentage === 100;

  const questions = test?.questions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {isGreat && <ConfettiCelebration trigger={true} />}

      <div className="w-full max-w-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
              isPerfect ? 'bg-gradient-to-tr from-amber-400 to-yellow-600 shadow-amber-500/30' :
              isGreat ? 'bg-gradient-to-tr from-brand-500 to-teal-600 shadow-brand-500/30' :
              'bg-gradient-to-tr from-indigo-500 to-purple-600'
            }`}>
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                Exam Diagnostic & Performance Breakdown
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {result.testTitle || 'Mastery Assessment'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* Top Score & Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-center">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Score</span>
              <h4 className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-1 font-mono">
                {percentage}%
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">{result.score} / {result.totalPoints} Points</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-center">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">XP Awarded</span>
              <h4 className="text-3xl font-black text-amber-500 mt-1 font-mono flex items-center justify-center gap-1">
                <Zap className="w-6 h-6 fill-amber-500" />
                +{Math.round((percentage / 100) * (test?.xpReward || 150))}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Applied to Leaderboard</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-center">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Time Spent</span>
              <h4 className="text-3xl font-black text-indigo-500 mt-1 font-mono">
                {Math.floor((result.timeSpentSeconds || 0) / 60)}m {((result.timeSpentSeconds || 0) % 60)}s
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Exam Duration</p>
            </div>
          </div>

          {/* AI Remediation Diagnosis */}
          {result.aiDiagnosis && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 to-indigo-500/10 border border-brand-500/20 space-y-1.5">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-500" /> AI Pedagogical Diagnosis
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {result.aiDiagnosis}
              </p>
            </div>
          )}

          {/* Detailed Question Review */}
          <div className="space-y-4 pt-2">
            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brand-500" /> Question-by-Question Solution Review
            </h4>

            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userAns = result.answers?.[q.id];
                const isCorrect = userAns === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border ${
                      isCorrect
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">
                        Q{idx + 1}. <LaTeXRenderer content={q.question} />
                      </span>
                      {isCorrect ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold text-[10px] flex-shrink-0">
                          <XCircle className="w-3 h-3" /> Missed
                        </span>
                      )}
                    </div>

                    {/* Chosen vs Correct Options */}
                    <div className="mt-3 space-y-1.5">
                      {q.options?.map((opt, optIdx) => {
                        const isChosen = userAns === optIdx;
                        const isCorrectOption = q.correctAnswer === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                              isCorrectOption
                                ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-500/40'
                                : isChosen && !isCorrect
                                ? 'bg-rose-100/80 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 font-semibold border border-rose-500/40'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <span className="font-mono font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                            <div className="flex-1">
                              <LaTeXRenderer content={opt} />
                            </div>
                            {isCorrectOption && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Correct Answer</span>}
                            {isChosen && !isCorrect && <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">✗ Your Choice</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Step-by-step reasoning */}
                    {q.explanation && (
                      <div className="mt-3 p-3 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300">
                        <p className="font-bold text-[10px] text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
                          Step-by-Step Reasoning:
                        </p>
                        <LaTeXRenderer content={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20"
            >
              Done & Return to Dashboard
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
