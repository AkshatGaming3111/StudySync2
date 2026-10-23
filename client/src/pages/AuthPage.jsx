import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  GraduationCap,
  Brain,
  Lock,
  Mail,
  User,
  Hash,
  Layers,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import SlidingBackground from '../components/Common/SlidingBackground';

export default function AuthPage({ initialMode = 'login', onBackToLanding }) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [role, setRole] = useState('student'); // 'student' or 'teacher'

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gradeClass, setGradeClass] = useState('Grade 11');
  const [section, setSection] = useState('A');
  const [specialty, setSpecialty] = useState('Computer Science');
  const [bio, setBio] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const classOptions = [
    'Grade 6',
    'Grade 7',
    'Grade 8',
    'Grade 9',
    'Grade 10',
    'Grade 11',
    'Grade 12',
    'Undergraduate / College'
  ];

  const sectionOptions = ['A', 'B', 'C', 'D', 'E'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide your registered Email and Password.');
      return;
    }

    if (!gradeClass || !section) {
      setError('Please select both Class and Section.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login({
          email: email.trim(),
          password: password.trim(),
          gradeClass,
          section
        });
      } else {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }

        if (password.length < 4) {
          setError('Password must be at least 4 characters long.');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match. Please re-enter.');
          setLoading(false);
          return;
        }

        await register({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
          gradeClass,
          section,
          specialty: role === 'teacher' ? specialty : undefined,
          bio
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col justify-between font-sans selection:bg-brand-500 selection:text-white p-4 sm:p-8 relative">
      
      {/* Dynamic Sliding Background Matrix & Knowledge Stream */}
      <SlidingBackground />

      {/* Top Bar with Back Button */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">StudySync</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-gray-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl z-10 space-y-6">
        
        {/* Card Header & Tabs */}
        <div className="space-y-4 text-center">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {mode === 'login' ? 'Sign In to StudySync' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {mode === 'login'
                ? 'Enter your registered Email, Password, Class, and Section.'
                : 'Join virtual classrooms, interactive whiteboards, and AI tools.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="p-1 rounded-2xl bg-black/40 border border-white/10 flex text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Role Selector (when Registering) */}
        {mode === 'register' && (
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all ${
                  role === 'student'
                    ? 'bg-brand-500/20 border-brand-500 text-brand-300 ring-1 ring-brand-500'
                    : 'bg-black/20 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Brain className="w-4 h-4" /> Student
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all ${
                  role === 'teacher'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500'
                    : 'bg-black/20 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Teacher
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Full Name (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'teacher' ? 'e.g. Dr. Alex Morgan' : 'e.g. Jordan Lee'}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                />
              </div>
            </div>
          )}

          {/* Registered Email */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@school.edu"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Mandatory Class & Section Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <label className="block text-[11px] font-bold text-brand-400 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Class / Grade
              </label>
              <select
                value={gradeClass}
                onChange={(e) => setGradeClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {classOptions.map((cls) => (
                  <option key={cls} value={cls} className="bg-gray-900 text-white">
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-brand-400 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {sectionOptions.map((sec) => (
                  <option key={sec} value={sec} className="bg-gray-900 text-white">
                    Section {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Teacher Subject/Specialty (Register only) */}
          {mode === 'register' && role === 'teacher' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">Teaching Subject / Domain</label>
              <select
                value={specialty || 'Maths (Algebra, Geometry, Trigonometry, Mensuration)'}
                onChange={(e) => setSpecialty(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <optgroup label="Main Subjects" className="font-bold text-brand-400 bg-gray-900">
                  <option value="Maths (Algebra, Geometry, Trigonometry, Mensuration)" className="text-white">
                    Maths (Geometry, Trigonometry, Mensuration, Algebra)
                  </option>
                  <option value="Science (Physics)" className="text-white">Science (Physics)</option>
                  <option value="Science (Chemistry)" className="text-white">Science (Chemistry)</option>
                  <option value="Science (Biology)" className="text-white">Science (Biology)</option>
                  <option value="Social Studies (History)" className="text-white">Social Studies (History)</option>
                  <option value="Social Studies (Civics)" className="text-white">Social Studies (Civics)</option>
                  <option value="Social Studies (Geography)" className="text-white">Social Studies (Geography)</option>
                  <option value="Social Studies (Economics)" className="text-white">Social Studies (Economics)</option>
                </optgroup>
                <optgroup label="Language Subjects" className="font-bold text-violet-400 bg-gray-900">
                  <option value="English (Literature & Grammar)" className="text-white">English (Literature & Grammar)</option>
                  <option value="Hindi (Vyakaran & Sahitya)" className="text-white">Hindi (Vyakaran & Sahitya)</option>
                </optgroup>
                <optgroup label="Extra Subjects" className="font-bold text-teal-400 bg-gray-900">
                  <option value="IT (Information Technology)" className="text-white">IT (Information Technology)</option>
                  <option value="PE (Physical Education)" className="text-white">PE (Physical Education)</option>
                </optgroup>
              </select>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-brand-500 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Account...</span>
              ) : mode === 'login' ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Classroom</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create {role === 'teacher' ? 'Teacher' : 'Student'} Account</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Footer info */}
        <div className="text-center pt-2 text-[11px] text-gray-500">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="text-brand-400 font-bold hover:underline"
              >
                Create one now
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-brand-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>

      {/* Bottom Footer Note */}
      <div className="text-center text-[11px] text-gray-600 z-10">
        StudySync Intelligent Classroom Security • Encrypted Database Credentials
      </div>

    </div>
  );
}
