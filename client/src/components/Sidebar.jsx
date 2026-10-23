import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  Trophy,
  PenTool,
  Brain,
  Settings,
  Layers,
  Users,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClass } from '../context/ClassContext';

export default function Sidebar({ activeTab: legacyActiveTab, setActiveTab: legacySetActiveTab }) {
  const { currentUser, isTeacher, logout } = useAuth();
  const { activeClass } = useClass();
  const location = useLocation();
  const navigate = useNavigate();

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
    return legacyActiveTab || 'dashboard';
  };

  const activeTab = getActiveTab();

  const handleNavClick = (id) => {
    const routeMap = {
      dashboard: '/dashboard',
      classroom: activeClass ? `/classes/${activeClass.id}/stream` : '/classes',
      assignments: '/assignments',
      tests: '/arena',
      leaderboard: '/leaderboard',
      whiteboard: activeClass ? `/classes/${activeClass.id}/whiteboard` : '/whiteboard',
      flashcards: '/flashcards',
      settings: '/settings'
    };

    const targetRoute = routeMap[id] || `/${id}`;
    navigate(targetRoute);
    if (legacySetActiveTab) {
      legacySetActiveTab(id);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classroom', label: 'Virtual Class', icon: GraduationCap, badge: activeClass ? activeClass.code : null, highlight: true },
    { id: 'assignments', label: 'Homework & AI Grading', icon: FileCheck2 },
    { id: 'tests', label: 'Exam Arena & Quizzes', icon: Brain },
    { id: 'leaderboard', label: 'Leaderboard & Badges', icon: Trophy },
    { id: 'whiteboard', label: 'SyncBoard Whiteboard', icon: PenTool },
    { id: 'flashcards', label: 'AI Notes & Flashcards', icon: Layers },
    { id: 'settings', label: 'Settings & API Config', icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col justify-between p-4 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border-r border-gray-200/80 dark:border-white/10 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        
        {/* Navigation items */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
            Platform Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500 to-teal-600 text-white shadow-md shadow-brand-500/25 font-bold ring-1 ring-brand-400/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
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

        {/* Active Class Box if present */}
        {activeClass && (
          <div
            onClick={() => navigate(`/classes/${activeClass.id}/stream`)}
            className="p-4 rounded-2xl bg-gradient-to-br from-brand-500/10 via-indigo-500/5 to-transparent border border-brand-500/25 space-y-1.5 cursor-pointer hover:border-brand-500/60 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              <span>Active Classroom</span>
              <span className="font-mono bg-brand-500/20 px-2 py-0.5 rounded-full text-brand-700 dark:text-brand-300">
                {activeClass.code}
              </span>
            </div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {activeClass.title}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{activeClass.schedule}</p>
          </div>
        )}

      </div>

      {/* Footer Profile & Logout */}
      <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-2">
        <div className="p-3 rounded-2xl bg-gray-100/70 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full object-cover border border-brand-500"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-gray-400 capitalize">
                {currentUser?.role} • {currentUser?.gradeClass ? `${currentUser.gradeClass}-${currentUser.section}` : ''}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-extrabold text-brand-500 font-mono flex-shrink-0 ml-1">
            {currentUser?.xp || 0} XP
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
