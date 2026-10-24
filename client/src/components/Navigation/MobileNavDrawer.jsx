import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import { useTheme } from '../../context/ThemeContext';
import { useCommercial } from '../../context/CommercialContext';
import {
  X,
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  Brain,
  Trophy,
  PenTool,
  Layers,
  Settings,
  LogOut,
  Sparkles,
  Zap,
  Flame,
  Sun,
  Moon,
  PlusCircle,
  Hash,
  Bot,
  ChevronRight,
  Check,
  BookOpen,
  CreditCard,
  FileText
} from 'lucide-react';

export default function MobileNavDrawer({
  isOpen,
  onClose,
  onOpenAI,
  onOpenJoinModal,
  onOpenCreateModal
}) {
  const { currentUser, isTeacher, logout } = useAuth();
  const { classes, activeClass, selectClass } = useClass();
  const { isDark, toggleTheme } = useTheme();
  const { openPricing, openReport } = useCommercial();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getActiveTab = () => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return 'dashboard';
    if (p.startsWith('/classes')) return 'classroom';
    if (p.startsWith('/assignments')) return 'assignments';
    if (p.startsWith('/arena') || p.startsWith('/tests')) return 'tests';
    if (p.startsWith('/leaderboard')) return 'leaderboard';
    if (p.startsWith('/whiteboard')) return 'whiteboard';
    if (p.startsWith('/flashcards')) return 'flashcards';
    if (p.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const handleNavClick = (route) => {
    navigate(route);
    onClose();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    {
      id: 'classroom',
      label: 'Virtual Classroom',
      icon: GraduationCap,
      route: activeClass ? `/classes/${activeClass.id}/stream` : '/classes',
      badge: activeClass ? activeClass.code : null
    },
    { id: 'assignments', label: 'Homework & AI Grading', icon: FileCheck2, route: '/assignments' },
    { id: 'tests', label: 'Exam Arena & Quizzes', icon: Brain, route: '/arena' },
    { id: 'leaderboard', label: 'Leaderboard & Badges', icon: Trophy, route: '/leaderboard' },
    {
      id: 'whiteboard',
      label: 'SyncBoard Whiteboard',
      icon: PenTool,
      route: activeClass ? `/classes/${activeClass.id}/whiteboard` : '/whiteboard'
    },
    { id: 'flashcards', label: 'AI Notes, Audio & Decks', icon: Layers, route: '/flashcards' },
    { id: 'settings', label: 'Settings & API Keys', icon: Settings, route: '/settings' }
  ];

  // XP calculation
  const currentXP = currentUser?.xp || 0;
  const currentLevel = currentUser?.level || 1;
  const xpForCurrentLevel = (currentLevel - 1) * 300;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((currentXP - xpForCurrentLevel) / 300) * 100)));

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-dark-surface h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 border-r border-gray-200 dark:border-dark-border animate-in slide-in-from-left duration-250">
        
        {/* Top Header & User Identity */}
        <div>
          {/* Header Bar */}
          <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-teal-500/10 via-brand-500/10 to-indigo-500/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 via-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-black text-base tracking-tight bg-gradient-to-r from-teal-500 via-brand-500 to-indigo-500 bg-clip-text text-transparent">
                StudySync
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-4 border-b border-gray-100 dark:border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-500 shadow-sm"
              />
              <div className="truncate flex-1">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {currentUser?.name || 'Student'}
                </h4>
                <p className="text-[11px] text-gray-400 truncate">{currentUser?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    {currentUser?.role || 'student'}
                  </span>
                  {currentUser?.gradeClass && (
                    <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400">
                      {currentUser.gradeClass} • Sec {currentUser.section || 'A'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Level, XP & Streak Stats Pill */}
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1 text-gray-800 dark:text-gray-200">
                  <Zap className="w-3.5 h-3.5 text-brand-500" />
                  <span>Level {currentLevel} Scholar</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{currentUser?.streak || 1}d Streak</span>
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>XP Progress</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">{currentXP} XP</span>
              </div>
            </div>
          </div>

          {/* Ask StudyBot AI Quick Launch */}
          <div className="p-4 pb-2 space-y-2">
            <button
              onClick={() => {
                onClose();
                onOpenAI();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 via-brand-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 active:scale-95 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <span>Ask StudyBot AI Voice Tutor</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            </button>

            {/* Commercial Plan & Parent Report Quick Links */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  openPricing();
                }}
                className="py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CreditCard className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-[11px] font-bold truncate">Plans & Pro</span>
                </div>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                  {currentUser?.plan || 'Free'}
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  openReport(currentUser?.id);
                }}
                className="py-2 px-3 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-700 dark:text-brand-300 text-left transition-colors flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                <span className="text-[11px] font-bold truncate">Report Card</span>
              </button>
            </div>
          </div>

          {/* Enrolled Classroom Switcher */}
          <div className="px-4 py-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                My Classrooms ({classes.length})
              </span>
              {isTeacher ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateModal();
                  }}
                  className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" /> New Class
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onOpenJoinModal();
                  }}
                  className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <Hash className="w-3 h-3" /> Join Code
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {classes.length > 0 ? (
                classes.map((cls) => {
                  const isSelected = activeClass?.id === cls.id;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => {
                        selectClass(cls);
                        handleNavClick(`/classes/${cls.id}/stream`);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-brand-500/10 border border-brand-500/40 text-brand-700 dark:text-brand-300 font-bold'
                          : 'bg-gray-50 dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="truncate text-xs font-bold">{cls.title}</p>
                        <p className="text-[10px] text-gray-400 truncate">{cls.subject} • {cls.code}</p>
                      </div>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 py-1">No classrooms yet.</p>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">
              Menu Navigation
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.route)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions: Theme Toggle & Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-white/10 space-y-2 bg-gray-50/50 dark:bg-dark-card/50">
          <button
            onClick={toggleTheme}
            className="w-full py-2 px-3 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span>{isDark ? 'Light Theme Mode' : 'Dark Theme Mode'}</span>
            </div>
            <span className="text-[10px] text-gray-400 uppercase font-bold">{isDark ? 'Dark' : 'Light'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
