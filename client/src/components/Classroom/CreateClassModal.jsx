import React, { useState } from 'react';
import { useClass } from '../../context/ClassContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  BookOpen,
  PlusCircle,
  Sparkles,
  Bot
} from 'lucide-react';

export default function CreateClassModal({ isOpen, onClose }) {
  const { createClass } = useClass();
  const { triggerXpGain } = useAuth();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [gradeLevel, setGradeLevel] = useState('Grade 11-12 / AP Prep');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState('Mon, Wed, Fri • 10:00 AM - 11:30 AM');
  const [roomLocation, setRoomLocation] = useState('Virtual Lab Alpha / Room 302');
  const [aiTutorPersona, setAiTutorPersona] = useState('Socratic Coding Mentor');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    setLoading(true);
    try {
      await createClass({
        title: title.trim(),
        subject,
        gradeLevel,
        description: description.trim() || 'Interactive virtual classroom on StudySync.',
        schedule,
        roomLocation,
        aiTutorPersona
      });

      triggerXpGain({
        xpGained: 100,
        reason: 'Created new interactive classroom'
      });
      onClose();
    } catch (err) {
      console.error('Failed to create class:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-dark-border flex items-center justify-between bg-gray-50/80 dark:bg-dark-surface/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Create Virtual Classroom</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Initialize room codes, schedule, and AI tutor</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Classroom Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AP Physics: Electromagnetism & Optics"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Subject Domain</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-brand-500"
              >
                <optgroup label="Main Subjects" className="font-bold text-brand-600 dark:text-brand-400">
                  <option value="Maths">Maths (Geometry, Trigonometry, Mensuration, Algebra)</option>
                  <option value="Science (Physics)">Science (Physics)</option>
                  <option value="Science (Chemistry)">Science (Chemistry)</option>
                  <option value="Science (Biology)">Science (Biology)</option>
                  <option value="Social Studies (History)">Social Studies (History)</option>
                  <option value="Social Studies (Civics)">Social Studies (Civics)</option>
                  <option value="Social Studies (Geography)">Social Studies (Geography)</option>
                  <option value="Social Studies (Economics)">Social Studies (Economics)</option>
                </optgroup>
                <optgroup label="Language Subjects" className="font-bold text-violet-600 dark:text-violet-400">
                  <option value="English">English (Literature & Grammar)</option>
                  <option value="Hindi">Hindi (Vyakaran & Sahitya)</option>
                </optgroup>
                <optgroup label="Extra Subjects" className="font-bold text-teal-600 dark:text-teal-400">
                  <option value="IT (Information Technology)">IT (Information Technology)</option>
                  <option value="PE (Physical Education)">PE (Physical Education)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Grade Level</label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="Grade 10-12"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Description & Syllabus Overview</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of modules, key learning outcomes, and expectations..."
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Schedule</label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Tue, Thu • 1:00 PM"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Room Location</label>
              <input
                type="text"
                value={roomLocation}
                onChange={(e) => setRoomLocation(e.target.value)}
                placeholder="Virtual Lab 202"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-brand-500" /> Embedded AI Co-Pilot Persona
            </label>
            <select
              value={aiTutorPersona}
              onChange={(e) => setAiTutorPersona(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white"
            >
              <option value="Socratic Coding Mentor">Socratic Coding Mentor</option>
              <option value="Visual Science Explainer">Visual Science Explainer</option>
              <option value="Deep Learning Research Coach">Deep Learning Research Coach</option>
              <option value="Exam Cram Coach">Exam Cram Coach</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-700 hover:to-brand-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Generating Classroom...' : 'Create Classroom (+100 XP)'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
