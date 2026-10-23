import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Timer,
  Zap,
  Music
} from 'lucide-react';

export default function PomodoroTimer() {
  const { currentUser, triggerXpGain } = useAuth();

  const [mode, setMode] = useState('focus'); // focus (25), short (5), long (15)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState('rain'); // none, rain, lofi, whitenoise
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Web Audio Context reference for zero-dependency ambient sound synthesis
  const audioCtxRef = useRef(null);
  const soundNodesRef = useRef([]);

  // Study tasks list
  const [tasks, setTasks] = useState([
    { id: 1, text: "Review Dijkstra & BFS graph complexity", completed: true },
    { id: 2, text: "Complete Longest Common Subsequence homework assignment", completed: false },
    { id: 3, text: "Test understanding with AI Exam Arena quiz", completed: false }
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // Switch modes
  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'focus') setSecondsLeft(25 * 60);
    else if (newMode === 'short') setSecondsLeft(5 * 60);
    else if (newMode === 'long') setSecondsLeft(15 * 60);
  };

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      triggerXpGain({
        xpGained: mode === 'focus' ? 40 : 10,
        reason: `Completed ${mode === 'focus' ? 'Focus Study Session' : 'Rest Break'}`
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, mode]);

  // Audio Synthesis generator (Web Audio API)
  const startAmbientAudio = (soundType) => {
    stopAmbientAudio();
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to simulate Rain / Soft Ambient
      const filter = ctx.createBiquadFilter();
      if (soundType === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 650;
      } else if (soundType === 'lofi') {
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 1.5;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
      }

      const gain = ctx.createGain();
      gain.gain.value = 0.05; // gentle relaxing volume

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(0);
      soundNodesRef.current = [whiteNoise, ctx];
      setIsAudioPlaying(true);
    } catch (e) {
      console.warn('Web Audio synthesis failed:', e);
    }
  };

  const stopAmbientAudio = () => {
    try {
      if (soundNodesRef.current.length > 0) {
        soundNodesRef.current[0].stop();
        soundNodesRef.current[1].close();
        soundNodesRef.current = [];
      }
    } catch (e) {}
    setIsAudioPlaying(false);
  };

  const toggleAudio = (type) => {
    if (isAudioPlaying && ambientSound === type) {
      stopAmbientAudio();
    } else {
      setAmbientSound(type);
      startAmbientAudio(type);
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientAudio();
    };
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), text: newTaskText.trim(), completed: false }]);
    setNewTaskText('');
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const completed = !t.completed;
        if (completed) {
          triggerXpGain({
            xpGained: 15,
            reason: 'Completed focus checklist task'
          });
        }
        return { ...t, completed };
      }
      return t;
    }));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-brand-500/10 to-teal-500/10 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Timer className="w-5 h-5 text-indigo-500" /> Focus Lounge & Deep Work Simulator
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            Boost deep cognitive retention with Pomodoro cycles, synthesized ambient soundscapes, and study checklists
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Pomodoro Clock & Ambient Sound */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col items-center justify-between space-y-6">
          
          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-dark-surface">
            {[
              { id: 'focus', label: '🧠 Focus (25m)' },
              { id: 'short', label: '☕ Short Break (5m)' },
              { id: 'long', label: '🌿 Long Break (15m)' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => switchMode(m.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  mode === m.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Large Countdown Clock */}
          <div className="relative flex items-center justify-center">
            <div className="w-64 h-64 rounded-full border-8 border-gray-100 dark:border-dark-border flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-dark-surface dark:to-dark-card shadow-inner">
              <div className="text-center">
                <h2 className="text-5xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
                  {formatTime(secondsLeft)}
                </h2>
                <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mt-2">
                  {mode === 'focus' ? 'Deep Study Session' : 'Relax & Recharge'}
                </p>
              </div>
            </div>
          </div>

          {/* Clock Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3 rounded-2xl font-bold text-sm text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 ${
                isRunning
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause Timer' : 'Start Focus'}</span>
            </button>

            <button
              onClick={() => switchMode(mode)}
              className="p-3 rounded-2xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Ambient Soundscapes Bar */}
          <div className="w-full pt-4 border-t border-gray-100 dark:border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 text-xs">
                <Music className="w-3.5 h-3.5 text-indigo-500" /> Synthesized Ambient Soundscape
              </span>
              {isAudioPlaying && (
                <span className="text-[10px] text-emerald-500 font-bold animate-pulse">● Playing Audio</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rain', label: '🌧️ Gentle Rain' },
                { id: 'lofi', label: '📻 Lo-Fi Cafe' },
                { id: 'whitenoise', label: '🌊 White Noise' }
              ].map((snd) => {
                const active = isAudioPlaying && ambientSound === snd.id;
                return (
                  <button
                    key={snd.id}
                    onClick={() => toggleAudio(snd.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <span>{snd.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Focus Checklist & XP Generator */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between space-y-4">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Session Checklist & Goals
                </h4>
                <p className="text-[11px] text-gray-500">Earn +15 XP for every completed study target</p>
              </div>

              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                {tasks.filter(t => t.completed).length} / {tasks.length} Done
              </span>
            </div>

            {/* Task list */}
            <div className="space-y-2 max-h-72 overflow-y-auto pt-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30 line-through text-gray-400'
                      : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500 cursor-pointer"
                    />
                    <span className="font-medium text-xs">{task.text}</span>
                  </label>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add task form */}
          <form onSubmit={handleAddTask} className="flex gap-2 pt-2 border-t border-gray-100 dark:border-dark-border">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add next study objective..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
            <button
              type="submit"
              disabled={!newTaskText.trim()}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-sm flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
