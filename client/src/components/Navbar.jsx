import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useClass } from '../context/ClassContext';
import { useCommercial } from '../context/CommercialContext';
import {
  Sun,
  Moon,
  Flame,
  Zap,
  BookOpen,
  ChevronDown,
  Sparkles,
  User,
  LogOut,
  PlusCircle,
  Hash,
  Bot,
  ShieldCheck,
  Settings,
  Menu,
  Building2,
  FileText,
  CreditCard
} from 'lucide-react';

export default function Navbar({ onOpenAI, onOpenJoinModal, onOpenCreateModal, onOpenDrawer }) {
  const navigate = useNavigate();
  const { currentUser, isTeacher, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { classes, activeClass, selectClass } = useClass();
  const { openPricing, openReport } = useCommercial();

  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Calculate XP progress
  const currentXP = currentUser?.xp || 0;
  const currentLevel = currentUser?.level || 1;
  const xpForCurrentLevel = (currentLevel - 1) * 300;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((currentXP - xpForCurrentLevel) / 300) * 100)));

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/10 transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand & Classroom Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          {/* Mobile Drawer Hamburger (Visible < lg) */}
          <button
            onClick={onOpenDrawer}
            className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors active:scale-95 flex-shrink-0"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none hover:opacity-90 transition-opacity flex-shrink-0"
            title="Go to Dashboard"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-400 via-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-teal-500 via-brand-500 to-indigo-500 bg-clip-text text-transparent">
                StudySync
              </span>
              {(currentUser?.institute || activeClass?.institute) && (
                <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">
                    {(currentUser?.institute || activeClass?.institute).name}
                  </span>
                </span>
              )}
              {currentUser?.gradeClass && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/60 font-mono">
                  {currentUser.gradeClass} • Sec {currentUser.section || 'A'}
                </span>
              )}
            </div>
          </div>

          {/* Active Class Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowClassDropdown(!showClassDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-800 dark:text-gray-200 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-brand-500" />
              <span className="max-w-[160px] truncate">
                {activeClass ? activeClass.title : 'Select Classroom'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showClassDropdown && (
              <div
                className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowClassDropdown(false)}
              >
                <div className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">
                  Enrolled Classrooms
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {classes.length > 0 ? (
                    classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => {
                          selectClass(cls);
                          navigate(`/classes/${cls.id}/stream`);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          activeClass?.id === cls.id
                            ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold'
                            : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate font-semibold">{cls.title}</p>
                          <p className="text-[10px] text-gray-400">{cls.subject} • Room {cls.code}</p>
                        </div>
                        {activeClass?.id === cls.id && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-gray-400">
                      No classrooms yet. {isTeacher ? 'Create your first classroom below!' : 'Join with a room code below!'}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 dark:border-white/10 mt-2 pt-2">
                  {isTeacher ? (
                    <button
                      onClick={onOpenCreateModal}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Create Classroom
                    </button>
                  ) : (
                    <button
                      onClick={onOpenJoinModal}
                      className="w-full py-2 px-3 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 hover:bg-brand-100 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Hash className="w-3.5 h-3.5" /> Join with Code
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Tools, Stats & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Commercial Plan Badge / Upgrade Button */}
          {currentUser?.plan === 'pro' ? (
            <button
              onClick={openPricing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-600 dark:text-amber-400 font-black text-[11px] shadow-sm hover:scale-102 transition-transform"
              title="StudySync Pro Active - Click to manage"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>PRO</span>
            </button>
          ) : currentUser?.plan === 'institute' ? (
            <button
              onClick={openPricing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-700/60 text-indigo-700 dark:text-indigo-300 font-black text-[11px] shadow-sm hover:scale-102 transition-transform"
              title="Institute Enterprise Active - Click to manage"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>INSTITUTE</span>
            </button>
          ) : (
            <button
              onClick={openPricing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-[11px] shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              title="Upgrade to StudySync Pro (Unlimited AI & Classrooms)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade</span>
            </button>
          )}

          {/* Ask StudyBot Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-transform active:scale-95"
            title="Ask StudyBot AI Classroom Assistant"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Ask StudyBot</span>
          </button>

          {/* Gamification: Streak */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 text-xs font-bold"
            title="Daily Learning Streak"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{currentUser?.streak || 1}d</span>
          </div>

          {/* Gamification: Level & XP */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs">
            <div className="flex items-center gap-1 font-bold text-gray-800 dark:text-gray-200">
              <Zap className="w-3.5 h-3.5 text-brand-500" />
              <span>Lvl {currentLevel}</span>
            </div>
            <div className="w-16 h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono font-bold">
              {currentXP} XP
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Profile Dropdown & Sign Out */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-brand-500 transition-all"
            >
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full object-cover border border-brand-500/60"
              />
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-10 h-10 rounded-full object-cover border border-brand-500"
                  />
                  <div className="truncate">
                    <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{currentUser?.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{currentUser?.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 uppercase">
                        {currentUser?.role}
                      </span>
                      {currentUser?.gradeClass && (
                        <span className="text-[10px] font-mono text-gray-400">
                          {currentUser.gradeClass}-{currentUser.section}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  {/* Plan Details & Upgrade */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      openPricing();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Subscription Plan</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60">
                      {currentUser?.plan || 'free'}
                    </span>
                  </button>

                  {/* Diagnostic Academic Report Card */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      openReport(currentUser.id);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-500" /> Diagnostic Report Card
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" /> Settings & Keys
                  </button>

                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
