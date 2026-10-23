import React, { useState } from 'react';
import { useClass } from '../../context/ClassContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Hash,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function JoinClassModal({ isOpen, onClose }) {
  const { joinClass } = useClass();
  const { triggerXpGain } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await joinClass(code.trim().toUpperCase());
      triggerXpGain({
        xpGained: 50,
        reason: `Enrolled in classroom with code ${code}`
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid room code');
    } finally {
      setLoading(false);
    }
  };

  const sampleCodes = ['CS101X', 'BIO102', 'AI2020'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-dark-border flex items-center justify-between bg-gray-50/80 dark:bg-dark-surface/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Join Virtual Classroom</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enter the 6-character room code from your teacher</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleJoin} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Class Room Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CS101X"
              maxLength={8}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-center font-mono font-black text-xl tracking-widest text-brand-600 dark:text-brand-400 focus:ring-2 focus:ring-brand-500 uppercase"
            />
          </div>

          {/* Quick demo codes */}
          <div>
            <span className="text-[11px] text-gray-400">Try quick demo codes:</span>
            <div className="flex gap-1.5 mt-1">
              {sampleCodes.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCode(c)}
                  className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-dark-surface hover:bg-brand-50 border border-gray-200 dark:border-dark-border font-mono text-[11px] font-bold text-gray-700 dark:text-gray-300"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-teal-600 hover:from-brand-600 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Verifying Room Code...' : 'Join Classroom (+50 XP)'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
