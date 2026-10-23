import React, { useState, useEffect } from 'react';
import { useClass } from '../../context/ClassContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CBSE_SYLLABUS } from '../../constants/cbseSyllabus';
import {
  X,
  Sparkles,
  Brain,
  Zap,
  Sliders,
  CheckCircle2,
  BookOpen,
  Award,
  GraduationCap
} from 'lucide-react';

export default function QuizGeneratorModal({ isOpen, onClose, onGenerated }) {
  const { activeClass, classes } = useClass();
  const { currentUser, triggerXpGain } = useAuth();

  const [gradeLevel, setGradeLevel] = useState(currentUser?.gradeClass || activeClass?.gradeLevel || 'Grade 10');
  const [subject, setSubject] = useState('Maths');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedClassId, setSelectedClassId] = useState(activeClass?.id || classes[0]?.id || '');
  const [loading, setLoading] = useState(false);

  // Available CBSE syllabus for selected grade and subject
  const currentGradeSyllabus = CBSE_SYLLABUS[gradeLevel] || CBSE_SYLLABUS['Grade 10'];
  const currentSubjectData = currentGradeSyllabus?.[subject] || currentGradeSyllabus?.['Maths'];
  const allChapters = currentSubjectData?.units?.flatMap(u => u.chapters) || [];

  useEffect(() => {
    if (allChapters.length > 0 && !selectedChapter) {
      setSelectedChapter(allChapters[0]);
    }
  }, [subject, gradeLevel]);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    const finalTopic = customTopic.trim() || selectedChapter;
    if (!finalTopic) return;

    setLoading(true);
    try {
      const res = await api.tests.generate({
        topic: finalTopic,
        subject,
        gradeLevel,
        difficulty,
        questionCount: parseInt(questionCount, 10) || 5,
        classId: selectedClassId
      });

      if (res.success && res.test) {
        triggerXpGain({
          xpGained: 30,
          reason: `Generated CBSE ${gradeLevel} Test Arena: ${subject}`
        });
        if (onGenerated) onGenerated(res.test);
        onClose();
      }
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-dark-border flex items-center justify-between bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  CBSE Curriculum Exam Generator
                </h3>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800">
                  Official NCERT Syllabus
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Generate board examination tests aligned with CBSE guidelines
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          {/* Grade / Class & Subject Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                CBSE Assigned Class
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-bold"
              >
                <option value="Grade 10">Class 10 (Secondary Board)</option>
                <option value="Grade 9">Class 9</option>
                <option value="Grade 11">Class 11 (Senior Secondary)</option>
                <option value="Grade 12">Class 12 (Board Examination)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Subject Domain
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setSelectedChapter('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-bold"
              >
                <optgroup label="Main Subjects" className="font-bold text-brand-600">
                  <option value="Maths">Maths (Code: 041)</option>
                  <option value="Science (Physics)">Science: Physics (Code: 086)</option>
                  <option value="Science (Chemistry)">Science: Chemistry (Code: 086)</option>
                  <option value="Science (Biology)">Science: Biology (Code: 086)</option>
                  <option value="Social Studies (History)">Social Studies: History (Code: 087)</option>
                  <option value="Social Studies (Civics)">Social Studies: Civics (Code: 087)</option>
                  <option value="Social Studies (Geography)">Social Studies: Geography (Code: 087)</option>
                  <option value="Social Studies (Economics)">Social Studies: Economics (Code: 087)</option>
                </optgroup>
                <optgroup label="Language Subjects" className="font-bold text-violet-600">
                  <option value="English">English Language & Literature (Code: 184)</option>
                  <option value="Hindi">Hindi Vyakaran & Sahitya (Code: 002/085)</option>
                </optgroup>
                <optgroup label="Extra Subjects" className="font-bold text-teal-600">
                  <option value="IT (Information Technology)">IT: Information Technology (Code: 402)</option>
                  <option value="PE (Physical Education)">PE: Health & Physical Education</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Official CBSE Chapter Selector */}
          <div className="p-4 rounded-2xl bg-brand-500/5 dark:bg-brand-950/30 border border-brand-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-brand-500" />
                Select Chapter from Official CBSE Syllabus:
              </label>
              {currentSubjectData?.subjectCode && (
                <span className="font-mono text-[10px] text-gray-400">
                  Subject Code: {currentSubjectData.subjectCode}
                </span>
              )}
            </div>

            <select
              value={selectedChapter}
              onChange={(e) => {
                setSelectedChapter(e.target.value);
                setCustomTopic('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-card border border-brand-500/40 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500"
            >
              {currentSubjectData?.units ? (
                currentSubjectData.units.map((u, uIdx) => (
                  <optgroup key={uIdx} label={u.unit} className="font-bold text-indigo-600 dark:text-indigo-400">
                    {u.chapters.map((ch, chIdx) => (
                      <option key={chIdx} value={ch} className="font-normal text-gray-900 dark:text-white">
                        {ch}
                      </option>
                    ))}
                  </optgroup>
                ))
              ) : (
                allChapters.map((ch, idx) => (
                  <option key={idx} value={ch}>{ch}</option>
                ))
              )}
            </select>
          </div>

          {/* Custom Subtopic / Specific Focus Area */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Custom Topic / Specific Chapter Focus (Optional Override)
            </label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Trigonometric Identities proof or Ohm's Law numericals"
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Difficulty & Question Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-semibold"
              >
                <option value="Easy">Standard (NCERT Direct Questions)</option>
                <option value="Medium">Moderate (CBSE Board Exam Pattern)</option>
                <option value="Hard">Advanced (Exemplar & High-Order Thinking)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Questions Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-semibold"
              >
                <option value="3">3 Questions (Quick Practice)</option>
                <option value="5">5 Questions (Standard Periodic Test)</option>
                <option value="8">8 Questions (Comprehensive Chapter Test)</option>
                <option value="10">10 Questions (Board Mock Arena)</option>
              </select>
            </div>
          </div>

          {/* Classroom Association */}
          {classes.length > 0 && (
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Assign to Classroom (Optional)
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-semibold"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                ))}
              </select>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || (!selectedChapter && !customTopic.trim())}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 via-teal-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Synthesizing CBSE Board Test & Rubrics...' : 'Assign CBSE Syllabus Test'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
