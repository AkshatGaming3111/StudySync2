import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  X,
  Upload,
  FileText,
  Users,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Download
} from 'lucide-react';

export default function BulkEnrollModal({ classId, classTitle, onEnrollSuccess, onClose }) {
  const [inputText, setInputText] = useState('');
  const [parsedStudents, setParsedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Handle Escape key to close
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Parse CSV / Text input
  const handleTextChange = (text) => {
    setInputText(text);
    setError(null);

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const students = [];

    lines.forEach(line => {
      // Support formats: "Name, Email, Section" or "Email, Name" or "email@example.com"
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        if (parts[0].includes('@')) {
          students.push({ email: parts[0], name: parts[1], section: parts[2] || 'A' });
        } else {
          students.push({ name: parts[0], email: parts[1], section: parts[2] || 'A' });
        }
      } else if (parts[0].includes('@')) {
        students.push({
          email: parts[0],
          name: parts[0].split('@')[0].replace(/[\._]/g, ' '),
          section: 'A'
        });
      }
    });

    setParsedStudents(students);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      handleTextChange(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const sample = `Aarav Sharma, aarav.sharma@studysync.edu, A
Diya Patel, diya.patel@studysync.edu, A
Rohan Verma, rohan.verma@studysync.edu, B
Ananya Gupta, ananya.gupta@studysync.edu, B
Kabir Mehta, kabir.mehta@studysync.edu, A`;
    handleTextChange(sample);
  };

  const handleSubmit = async () => {
    if (parsedStudents.length === 0) {
      setError('Please add at least one valid student with an email.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.classes.bulkEnroll(classId, parsedStudents);
      if (res.success) {
        setResult(res);
        if (onEnrollSuccess) {
          onEnrollSuccess(res);
        }
      } else {
        setError(res.error || 'Failed to enroll students');
      }
    } catch (err) {
      setError(err.message || 'Bulk enrollment error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl p-5 sm:p-8 text-gray-900 dark:text-gray-100 animate-in zoom-in-95 duration-200 cursor-default"
      >
        
        {/* Close / Exit Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs border border-gray-200 dark:border-white/10"
          title="Exit Roster Import (Esc)"
        >
          <X className="w-4 h-4" />
          <span>Exit</span>
        </button>

        {/* Title */}
        <div className="space-y-1 pb-4 border-b border-gray-100 dark:border-white/10">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-500 font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Institute Roster Management
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Bulk Student Roster Enrollment
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enroll students into <span className="font-bold text-gray-800 dark:text-gray-200">{classTitle || 'this classroom'}</span> in one click.
          </p>
        </div>

        {/* Result view */}
        {result ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Roster Enrolled Successfully!
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {result.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10">
              <div>
                <span className="text-gray-400">Enrolled Students:</span>
                <p className="font-bold text-sm text-brand-600">{result.enrolledCount}</p>
              </div>
              <div>
                <span className="text-gray-400">Total Roster Count:</span>
                <p className="font-bold text-sm text-emerald-600">{result.totalRosterCount}</p>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              New accounts have been created with temporary passkey <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 font-mono font-bold">Welcome@123</code>.
            </p>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25"
            >
              Done & Return to Classroom
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Paste CSV text (<code className="font-mono text-[11px]">Name, Email, Section</code>)
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  + Load Demo Roster
                </button>
                <label className="cursor-pointer text-[11px] font-bold px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 flex items-center gap-1 transition-colors">
                  <Upload className="w-3 h-3" />
                  <span>Upload .CSV</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="e.g.&#10;Aarav Sharma, aarav@studysync.edu, A&#10;Diya Patel, diya@studysync.edu, B"
              className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            {/* Preview Parsed Count */}
            {parsedStudents.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Detected Candidates ({parsedStudents.length}):</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 border border-gray-100 dark:border-white/10 rounded-2xl p-2 bg-gray-50/50 dark:bg-white/[0.02]">
                  {parsedStudents.map((st, i) => (
                    <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <span className="font-semibold">{st.name}</span>
                      <span className="font-mono text-[11px] text-gray-400">{st.email} • Sec {st.section}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-white/10 text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || parsedStudents.length === 0}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Enrolling Roster...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Enroll {parsedStudents.length || ''} Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
