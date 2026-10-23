import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  Lock,
  CheckCircle2,
  GraduationCap,
  Sigma,
  Dna,
  Code,
  Layers,
  HeartHandshake,
  Clock
} from 'lucide-react';

export default function BadgeGallery() {
  const { currentUser } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBadges() {
      try {
        const res = await api.leaderboards.getBadges();
        if (res.success) setBadges(res.badges);
      } catch (e) {
        console.error('Failed to load badges:', e);
      } finally {
        setLoading(false);
      }
    }
    loadBadges();
  }, []);

  const iconMap = {
    Sparkles,
    GraduationCap,
    Trophy,
    Sigma,
    Flame,
    Award,
    Zap,
    Dna,
    Code,
    HeartHandshake,
    Clock,
    Layers
  };

  const userBadges = new Set(currentUser?.badges || []);

  const rarityMap = {
    Legendary: 'from-amber-400 to-yellow-600 text-amber-900 border-amber-400/50',
    Epic: 'from-purple-500 to-indigo-600 text-purple-900 border-purple-500/50',
    Rare: 'from-blue-400 to-cyan-600 text-blue-900 border-blue-400/50',
    Common: 'from-emerald-400 to-teal-600 text-emerald-900 border-emerald-400/50'
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-500" /> Achievements & Badges Showcase
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Earn exclusive badges by completing homework, maintaining daily streaks, and topping exam arenas
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-2xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-bold font-mono">
          Unlocked: {userBadges.size} / {badges.length}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((b) => {
          const isUnlocked = userBadges.has(b.id);
          const Icon = iconMap[b.icon] || Award;
          const rarityStyle = rarityMap[b.rarity] || rarityMap.Common;

          return (
            <div
              key={b.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md'
                  : 'bg-gray-50/50 dark:bg-dark-surface/40 border-gray-200/60 dark:border-dark-border/40 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${b.color || 'from-teal-400 to-indigo-500'} flex items-center justify-center text-white shadow-md ${
                    !isUnlocked ? 'grayscale' : ''
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    b.rarity === 'Legendary' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                    b.rarity === 'Epic' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' :
                    b.rarity === 'Rare' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                    'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {b.rarity}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                    {b.name}
                    {isUnlocked && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-[11px]">
                {isUnlocked ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    ✓ Unlocked & Active
                  </span>
                ) : (
                  <span className="text-gray-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked Achievement
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
