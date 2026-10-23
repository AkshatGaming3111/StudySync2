import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'brand', trend }) {
  const colorMap = {
    brand: 'from-teal-500/10 to-teal-500/5 text-brand-500 border-brand-500/20',
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-500 border-indigo-500/20',
    purple: 'from-purple-500/10 to-purple-500/5 text-purple-500 border-purple-500/20',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-500 border-amber-500/20',
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-500 border-rose-500/20',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-500 border-emerald-500/20',
  };

  const selectedColor = colorMap[color] || colorMap.brand;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-dark-card border p-5 shadow-sm hover:shadow-md dark:shadow-specular hover:dark:shadow-specular-hover hover:-translate-y-1 transition-all duration-200 border-gray-200/80 dark:border-white/10 ${selectedColor.split(' ')[3] || ''}`}>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1.5">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              {trend && (
                <span className={`font-semibold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
              )}
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedColor.split(' ').slice(0, 2).join(' ')} ${selectedColor.split(' ')[2]} shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {/* Decorative ambient aurora background glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br from-brand-500/10 to-indigo-500/10 blur-xl pointer-events-none" />
    </div>
  );
}
