import React, { useState } from 'react';
import { useClass } from '../../context/ClassContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  Award,
  BookOpen,
  FileCheck2
} from 'lucide-react';

export default function CreateAssignmentModal({ isOpen, onClose, onCreated }) {
  const { activeClass, classes } = useClass();
  const { currentUser, triggerXpGain } = useAuth();

  const [selectedClassId, setSelectedClassId] = useState(activeClass?.id || classes[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(100);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [allowAIPrecheck, setAllowAIPrecheck] = useState(true);
  const [autoAIGrading, setAutoAIGrading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [rubric, setRubric] = useState([
    { criterion: "Conceptual Accuracy & State Transitions", maxPoints: 40, description: "Correct theoretical foundation and base cases" },
    { criterion: "Complexity Analysis (Big-O)", maxPoints: 30, description: "Rigorous proof of asymptotic time and space bounds" },
    { criterion: "Clarity, Formatting & Code Quality", maxPoints: 30, description: "Structured markdown, clean syntax, and helpful comments" }
  ]);

  if (!isOpen) return null;

  const handleAddRubricItem = () => {
    setRubric(prev => [...prev, { criterion: "New Criterion", maxPoints: 20, description: "Detailed requirement" }]);
  };

  const handleRemoveRubricItem = (idx) => {
    setRubric(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRubric = (idx, field, value) => {
    setRubric(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedClassId) return;

    setLoading(true);
    try {
      const res = await api.assignments.create({
        classId: selectedClassId,
        title: title.trim(),
        description: description.trim(),
        dueDate: new Date(dueDate).toISOString(),
        points: parseInt(points, 10) || 100,
        rubric,
        allowAIPrecheck,
        autoAIGrading
      });

      if (res.success) {
        triggerXpGain({
          xpGained: 50,
          reason: 'Created new interactive assignment'
        });
        if (onCreated) onCreated(res.assignment);
        onClose();
      }
    } catch (err) {
      console.error('Failed to create assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-dark-border flex items-center justify-between bg-gray-50/80 dark:bg-dark-surface/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Create New Assignment</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Set instructions, grading rubrics, and AI helpers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Class */}
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Target Classroom</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                ))}
              </select>
            </div>

            {/* Total Points */}
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Max Score Points</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                min="10"
                max="500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Assignment Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dynamic Programming: Longest Common Subsequence"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Description & Instructions */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Assignment Description & Prompt</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task, code requirements, expected proofs, and formatting rules..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Rubric Criteria Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-500" /> Evaluation Rubric Criteria
              </label>
              <button
                type="button"
                onClick={handleAddRubricItem}
                className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-100 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Criterion
              </button>
            </div>

            <div className="space-y-2">
              {rubric.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 space-y-1.5 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.criterion}
                        onChange={(e) => handleUpdateRubric(idx, 'criterion', e.target.value)}
                        placeholder="Criterion title"
                        className="flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border font-medium"
                      />
                      <div className="flex items-center gap-1 w-24">
                        <input
                          type="number"
                          value={item.maxPoints}
                          onChange={(e) => handleUpdateRubric(idx, 'maxPoints', parseInt(e.target.value, 10) || 0)}
                          className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-center font-bold"
                        />
                        <span className="text-gray-400">pts</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateRubric(idx, 'description', e.target.value)}
                      placeholder="Description & expectations..."
                      className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-500"
                    />
                  </div>

                  {rubric.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRubricItem(idx)}
                      className="self-end sm:self-center p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sm:hidden">Remove</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Features Toggle */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 to-indigo-500/10 border border-brand-500/20 space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-500" /> AI Intelligent Assistants
            </h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowAIPrecheck}
                  onChange={(e) => setAllowAIPrecheck(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">Enable Student AI Pre-check hints</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAIGrading}
                  onChange={(e) => setAutoAIGrading(e.target.checked)}
                  className="rounded text-indigo-500 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">Enable AI Rubric Auto-Grading</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 active:scale-95 transition-transform"
            >
              {loading ? 'Creating Assignment...' : 'Publish Assignment to Class Stream'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
