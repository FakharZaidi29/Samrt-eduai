import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Zap,
  Target,
  BookOpen,
  ArrowUp,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api.js';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.analytics.getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Analytics stats error:', err.message))
      .finally(() => setLoading(false));
  }, []);

  const metrics = stats ? [
    {
      label: 'Total Study Hours',
      value: stats.totalStudyHours.toFixed(1),
      unit: 'hrs',
      change: `${stats.totalStudyHours > 0 ? '+' : ''}${stats.totalStudyHours.toFixed(1)}`,
      up: stats.totalStudyHours >= 0,
      icon: Clock,
    },
    {
      label: 'Tasks Completed',
      value: stats.tasksCompleted.toString(),
      unit: '',
      change: `+${stats.tasksCompleted}`,
      up: true,
      icon: CheckCircle2,
    },
    {
      label: 'Weekly Progress',
      value: stats.weeklyProgress.toString(),
      unit: '%',
      change: `${stats.weeklyProgress}%`,
      up: stats.weeklyProgress >= 50,
      icon: TrendingUp,
    },
    {
      label: 'AI Credits Used',
      value: stats.aiCreditsUsed.toString(),
      unit: `/ ${stats.aiCreditsLimit}`,
      change: `${stats.aiCreditsLimit - stats.aiCreditsUsed} left`,
      up: (stats.aiCreditsLimit - stats.aiCreditsUsed) > 0,
      icon: Zap,
    },
  ] : [];

  const summaryItems = stats ? [
    { label: 'Study Plans', value: stats.totalPlans, icon: BookOpen, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'AI Sessions', value: stats.totalChats, icon: Target, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Day Streak', value: stats.streak, icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Credits Remaining', value: stats.aiCreditsLimit - stats.aiCreditsUsed, icon: Zap, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ] : [];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto space-y-6 pb-10">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track your learning performance and progress over time
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {metrics.map((m) => (
                <div key={m.label} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <m.icon size={17} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-lg ${
                      m.up
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    }`}>
                      <ArrowUp size={10} />
                      {m.change}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{m.value}</span>
                    {m.unit && <span className="text-xs text-slate-400">{m.unit}</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {summaryItems.map((item) => (
                <div key={item.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 text-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg} mx-auto mb-3`}>
                    <item.icon size={17} className={item.color} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Credits usage bar */}
            {stats && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5">
                <h2 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">AI Credits Usage</h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {stats.aiCreditsUsed} of {stats.aiCreditsLimit} credits used
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {Math.round((stats.aiCreditsUsed / stats.aiCreditsLimit) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((stats.aiCreditsUsed / stats.aiCreditsLimit) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  {stats.aiCreditsLimit - stats.aiCreditsUsed} credits remaining
                </p>
              </div>
            )}

            {/* Progress overview */}
            {stats && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5">
                <h2 className="font-semibold text-slate-900 dark:text-white text-sm mb-5">Overall Learning Progress</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Study Plan Completion', value: stats.weeklyProgress, color: 'bg-blue-600' },
                    {
                      label: 'AI Credits Used',
                      value: stats.aiCreditsLimit > 0 ? Math.round((stats.aiCreditsUsed / stats.aiCreditsLimit) * 100) : 0,
                      color: 'bg-amber-500',
                    },
                    {
                      label: 'Modules Completed',
                      value: stats.tasksCompleted > 0 ? Math.min(stats.tasksCompleted * 10, 100) : 0,
                      color: 'bg-emerald-500',
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{item.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.min(item.value, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Streak calendar */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Study Streak — June 2026</h2>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" /> Studied
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-zinc-800 inline-block" /> Missed
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 30 }, (_, i) => {
                  const studied = [1, 2, 3, 5, 6, 7, 8, 10, 12, 13, 14, 15, 17, 18, 20, 21, 22].includes(i + 1);
                  return (
                    <div
                      key={i}
                      title={`June ${i + 1}`}
                      className={`aspect-square rounded-md text-[10px] flex items-center justify-center font-medium transition-colors ${
                        studied
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600'
                      }`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
