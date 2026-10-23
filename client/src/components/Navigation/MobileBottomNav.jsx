import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useClass } from '../../context/ClassContext';
import {
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  Brain,
  Menu,
  Sparkles
} from 'lucide-react';

export default function MobileBottomNav({ onOpenDrawer }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeClass } = useClass();

  const getActiveTab = () => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return 'dashboard';
    if (p.startsWith('/classes')) return 'classroom';
    if (p.startsWith('/assignments')) return 'assignments';
    if (p.startsWith('/arena') || p.startsWith('/tests')) return 'tests';
    return '';
  };

  const activeTab = getActiveTab();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      route: '/dashboard'
    },
    {
      id: 'classroom',
      label: 'Class',
      icon: GraduationCap,
      route: activeClass ? `/classes/${activeClass.id}/stream` : '/classes',
      badge: activeClass ? activeClass.code : null
    },
    {
      id: 'assignments',
      label: 'Homework',
      icon: FileCheck2,
      route: '/assignments'
    },
    {
      id: 'tests',
      label: 'Arena',
      icon: Brain,
      route: '/arena'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-extrabold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {/* Active Top Glow Pill Indicator */}
              {isActive && (
                <span className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-teal-400 to-brand-500 shadow-sm shadow-brand-500/50" />
              )}

              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400'
                      : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {item.badge && !isActive && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-dark-surface" />
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-0.5 font-medium">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* 5th Tab: More / Drawer Menu */}
        <button
          onClick={onOpenDrawer}
          className="relative flex flex-col items-center justify-center flex-1 py-1 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 active:scale-95 transition-all"
        >
          <div className="p-1.5 rounded-xl">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
