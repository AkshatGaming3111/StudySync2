import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import {
  Trophy,
  Medal,
  Flame,
  Zap,
  Award,
  Users,
  Globe,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function LeaderboardTable() {
  const { currentUser } = useAuth();
  const { activeClass, classes } = useClass();

  const [tab, setTab] = useState('global'); // 'global', 'cohort', 'class'
  const [selectedClassId, setSelectedClassId] = useState(activeClass?.id || classes[0]?.id || '');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Keep selectedClassId synchronized when classes or activeClass load
  useEffect(() => {
    if (!selectedClassId && (activeClass?.id || classes[0]?.id)) {
      setSelectedClassId(activeClass?.id || classes[0]?.id);
    }
  }, [activeClass, classes, selectedClassId]);

  useEffect(() => {
    async function fetchRankings() {
      setLoading(true);
      try {
        if (tab === 'global') {
          const res = await api.leaderboards.getGlobal();
          if (res.success) setLeaderboard(res.leaderboard);
        } else if (tab === 'cohort') {
          const res = await api.leaderboards.getCohort({
            gradeClass: currentUser?.gradeClass || 'Grade 10',
            section: currentUser?.section || 'B'
          });
          if (res.success) setLeaderboard(res.leaderboard);
        } else if (tab === 'class') {
          const classIdToFetch = selectedClassId || activeClass?.id || classes[0]?.id;
          if (classIdToFetch) {
            const res = await api.leaderboards.getClass(classIdToFetch);
            if (res.success) setLeaderboard(res.leaderboard);
          }
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, [tab, selectedClassId, activeClass, currentUser]);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  const cohortName = currentUser?.gradeClass && currentUser?.section 
    ? `${currentUser.gradeClass} - Sec ${currentUser.section}` 
    : 'Grade 10 - Sec B';

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> StudySync Leaderboard & Rankings
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time standings updated after every homework submission and quiz arena
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-surface p-1 rounded-xl flex-nowrap">
            <button
              onClick={() => setTab('global')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                tab === 'global'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Global
            </button>
            <button
              onClick={() => setTab('cohort')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                tab === 'cohort'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> {cohortName}
            </button>
            <button
              onClick={() => setTab('class')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                tab === 'class'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Class
            </button>
          </div>

          {tab === 'class' && classes.length > 0 && (
            <select
              value={selectedClassId || activeClass?.id || classes[0]?.id || ''}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs font-semibold dark:text-white whitespace-nowrap"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Top 3 Podium Showcase */}
      {!loading && topThree.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          {/* Rank #2 (Silver) - Order 2 on mobile, Order 1 on sm+ desktop */}
          {topThree[1] && (
            <div className="order-2 sm:order-1 sm:mt-6 p-5 rounded-3xl bg-gradient-to-b from-gray-100/90 to-white dark:from-dark-card dark:to-dark-surface border-2 border-slate-300 dark:border-slate-700 shadow-md text-center flex flex-col items-center justify-between">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs font-mono">
                  🥈 Rank #2
                </span>
                <div className="relative mx-auto mt-2">
                  <img
                    src={topThree[1].avatar}
                    alt={topThree[1].name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-slate-300 shadow-md"
                  />
                  <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded bg-slate-500 text-white font-bold text-[10px]">
                    Lvl {topThree[1].level}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white pt-1">{topThree[1].name}</h4>
                <p className="text-xs text-gray-400">{topThree[1].gradeLevel || 'Student'}</p>
              </div>

              <div className="w-full mt-4 pt-3 border-t border-gray-200 dark:border-dark-border flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" /> {topThree[1].streak}d
                </span>
                <span className="font-extrabold text-brand-500 font-mono text-sm">
                  {topThree[1].xp} XP
                </span>
              </div>
            </div>
          )}

          {/* Rank #1 (Gold Champion) - Order 1 on mobile, Order 2 on sm+ desktop */}
          {topThree[0] && (
            <div className="order-1 sm:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 via-brand-500/5 to-white dark:to-dark-surface border-2 border-amber-400 dark:border-amber-500 shadow-xl text-center flex flex-col items-center justify-between transform sm:-translate-y-2">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-extrabold text-xs shadow-sm">
                  👑 Grand Champion #1
                </span>
                <div className="relative mx-auto mt-2">
                  <img
                    src={topThree[0].avatar}
                    alt={topThree[0].name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-lg ring-4 ring-amber-400/20"
                  />
                  <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-xs">
                    Lvl {topThree[0].level}
                  </span>
                </div>
                <h4 className="font-black text-base text-gray-900 dark:text-white pt-1">{topThree[0].name}</h4>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{topThree[0].gradeLevel || 'Top Scholar'}</p>
              </div>

              <div className="w-full mt-4 pt-3 border-t border-amber-400/20 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Flame className="w-4 h-4 fill-amber-500" /> {topThree[0].streak} Days
                </span>
                <span className="font-black text-amber-500 font-mono text-base">
                  {topThree[0].xp} XP
                </span>
              </div>
            </div>
          )}

          {/* Rank #3 (Bronze) - Order 3 */}
          {topThree[2] && (
            <div className="order-3 sm:order-3 sm:mt-8 p-5 rounded-3xl bg-gradient-to-b from-amber-950/10 to-white dark:from-dark-card dark:to-dark-surface border-2 border-amber-700/50 shadow-md text-center flex flex-col items-center justify-between">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-900/30 text-amber-700 dark:text-amber-300 font-extrabold text-xs font-mono">
                  🥉 Rank #3
                </span>
                <div className="relative mx-auto mt-2">
                  <img
                    src={topThree[2].avatar}
                    alt={topThree[2].name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-amber-700/50 shadow-md"
                  />
                  <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded bg-amber-700 text-white font-bold text-[10px]">
                    Lvl {topThree[2].level}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white pt-1">{topThree[2].name}</h4>
                <p className="text-xs text-gray-400">{topThree[2].gradeLevel || 'Student'}</p>
              </div>

              <div className="w-full mt-4 pt-3 border-t border-gray-200 dark:border-dark-border flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" /> {topThree[2].streak}d
                </span>
                <span className="font-extrabold text-brand-500 font-mono text-sm">
                  {topThree[2].xp} XP
                </span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="overflow-hidden rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border text-gray-400 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4 w-16 text-center">Rank</th>
              <th className="p-4">Student</th>
              <th className="p-4 hidden sm:table-cell">Streak</th>
              <th className="p-4 hidden md:table-cell">Quizzes / Assignments</th>
              <th className="p-4 text-right">Total XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
            {leaderboard.map((user) => {
              const isMe = user.id === currentUser?.id;

              return (
                <tr
                  key={user.id}
                  className={`transition-colors ${
                    isMe
                      ? 'bg-brand-50/70 dark:bg-brand-950/40 font-semibold'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-hover text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <td className="p-4 text-center font-black font-mono text-sm">
                    {user.rank === 1 ? '🥇 1' : user.rank === 2 ? '🥈 2' : user.rank === 3 ? '🥉 3' : `#${user.rank}`}
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-dark-border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 dark:text-white">{user.name}</span>
                        {isMe && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500 text-white font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">Level {user.level} • {user.gradeLevel}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" /> {user.streak}d
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-gray-500">
                    {user.stats?.quizzesCompleted || 0} Quizzes • {user.stats?.assignmentsCompleted || 0} Assignments
                  </td>
                  <td className="p-4 text-right font-black font-mono text-brand-600 dark:text-brand-400 text-sm">
                    {user.xp} XP
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
