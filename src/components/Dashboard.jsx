import { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Zap,
  TrendingUp,
  Star,
  ArrowRight,
  Play,
  Sparkles,
  Brain,
  Target,
  ChevronRight,
  MessageSquare,
  FileText,
  Flame,
  BookOpen,
  Loader2,
  GraduationCap,
  Users,
  Code2,
} from 'lucide-react';

const TEAM = [
  { name: 'Fakhar Abbas', role: 'Team Lead & Full Stack Developer', emoji: '💻', color: 'from-blue-500 to-blue-700' },
 { name: 'Muniba', role: 'Frontend Developer', emoji: '✍️', color: 'from-emerald-500 to-teal-600' },
  { name: 'Muskan', role: 'Product Manager', emoji: '⚡', color: 'from-pink-500 to-rose-600' },
  { name: 'Faryal', role: 'UI/UX Designer', emoji: '🎨', color: 'from-violet-500 to-purple-600' },
  
  { name: 'Arifa', role: 'Research Lead', emoji: '🔬', color: 'from-amber-500 to-orange-500' },
  { name: 'Sajaullah', role: 'Testing Engineer', emoji: '🛠️', color: 'from-cyan-500 to-blue-600' },
  { name: 'Abdul Rehman', role: 'QA Engineer', emoji: '🧪', color: 'from-slate-500 to-slate-700' },
];
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

// ─── Color tokens ─────────────────────────────────────────────────────────────

const COLOR = {
  red: {
    icon: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  },
  emerald: {
    icon: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    icon: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  },
};

const LEVEL_COLOR = {
  Beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const LESSONS = [
  {
    title: 'Introduction to Neural Networks',
    subject: 'Machine Learning',
    duration: '45 min',
    level: 'Intermediate',
    progress: 35,
    rating: 4.9,
    gradient: 'from-blue-600 to-blue-800',
  },
  {
    title: 'Data Structures & Algorithms',
    subject: 'Computer Science',
    duration: '60 min',
    level: 'Advanced',
    progress: 0,
    rating: 4.8,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Calculus: Limits & Derivatives',
    subject: 'Mathematics',
    duration: '30 min',
    level: 'Beginner',
    progress: 72,
    rating: 4.7,
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    title: 'Quantum Mechanics Basics',
    subject: 'Physics',
    duration: '50 min',
    level: 'Advanced',
    progress: 10,
    rating: 4.9,
    gradient: 'from-green-600 to-green-800',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, unit, change, progress, icon: Icon, color, gradient }) {
  const c = COLOR[color] || COLOR.red;
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-sm transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon size={19} />
        </div>
        <span className={`text-[11px] font-medium px-2 py-1 rounded-lg ${c.badge}`}>
          {change}
        </span>
      </div>
      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-[26px] font-bold text-slate-900 dark:text-white leading-none">{value}</span>
          <span className="text-sm text-slate-400 dark:text-slate-500">{unit}</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      </div>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

function LessonCard({ lesson, onStart }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md transition-all duration-300 group cursor-pointer">
      <div className={`h-1.5 bg-gradient-to-r ${lesson.gradient}`} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            {lesson.subject}
          </span>
          <div className="flex items-center gap-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{lesson.rating}</span>
          </div>
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 line-clamp-2 leading-snug">
          {lesson.title}
        </h3>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <Clock size={11} />
            <span>{lesson.duration}</span>
          </div>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${LEVEL_COLOR[lesson.level]}`}>
            {lesson.level}
          </span>
        </div>

        {lesson.progress > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Progress</span>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{lesson.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full bg-gradient-to-r ${lesson.gradient} rounded-full`}
                style={{ width: `${lesson.progress}%` }}
              />
            </div>
            <button onClick={() => onStart(lesson)} className="w-full py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-1.5">
              <Play size={11} fill="currentColor" />
              Continue Learning
            </button>
          </div>
        ) : (
          <button onClick={() => onStart(lesson)} className="w-full py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5">
            <Play size={11} />
            Start Learning
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard({ setActiveView, goToChat }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    api.analytics.getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Stats fetch error:', err.message))
      .finally(() => setStatsLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const streak = stats?.streak ?? user?.streak ?? 0;
  const weeklyProgress = stats?.weeklyProgress ?? 0;

  const statCards = [
    {
      label: 'Study Hours',
      value: statsLoading ? '—' : (stats?.totalStudyHours ?? 0).toFixed(1),
      unit: 'hrs',
      change: 'Total',
      progress: Math.min((stats?.totalStudyHours ?? 0) / 50 * 100, 100),
      icon: Clock,
      color: 'red',
      gradient: 'from-blue-600 to-blue-700',
    },
    {
      label: 'Tasks Completed',
      value: statsLoading ? '—' : (stats?.tasksCompleted ?? 0).toString(),
      unit: 'tasks',
      change: `${stats?.totalPlans ?? 0} plans`,
      progress: Math.min((stats?.tasksCompleted ?? 0) / 50 * 100, 100),
      icon: CheckCircle2,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'AI Credits Used',
      value: statsLoading ? '—' : (stats?.aiCreditsUsed ?? 0).toString(),
      unit: 'credits',
      change: `${(stats?.aiCreditsLimit ?? 500) - (stats?.aiCreditsUsed ?? 0)} left`,
      progress: stats?.aiCreditsLimit ? ((stats.aiCreditsUsed / stats.aiCreditsLimit) * 100) : 0,
      icon: Zap,
      color: 'amber',
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      label: 'Weekly Progress',
      value: statsLoading ? '—' : weeklyProgress.toString(),
      unit: '%',
      change: `${stats?.totalChats ?? 0} chats`,
      progress: weeklyProgress,
      icon: TrendingUp,
      color: 'red',
      gradient: 'from-blue-500 to-blue-700',
    },
  ];

  const activities = [
    { text: 'AI chat sessions', time: `${stats?.totalChats ?? 0} total`, icon: MessageSquare, color: 'red' },
    { text: 'Study plans created', time: `${stats?.totalPlans ?? 0} plans`, icon: Sparkles, color: 'red' },
    { text: 'Modules completed', time: `${stats?.tasksCompleted ?? 0} total`, icon: CheckCircle2, color: 'emerald' },
    { text: 'Study hours logged', time: `${(stats?.totalStudyHours ?? 0).toFixed(1)} hrs`, icon: FileText, color: 'emerald' },
    { text: 'AI credits remaining', time: `${(stats?.aiCreditsLimit ?? 500) - (stats?.aiCreditsUsed ?? 0)} left`, icon: Target, color: 'amber' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-7xl mx-auto space-y-6 pb-10">

        {/* Hero / Welcome banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-6 md:p-8 text-white overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 left-1/3 w-64 h-64 rounded-full bg-blue-700/20 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-blue-300" />
                <span className="text-blue-300 text-xs font-medium tracking-wide">AI-Powered Learning</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
              <p className="text-blue-100 text-sm max-w-md leading-relaxed">
                {streak > 0 ? (
                  <>
                    You're on a{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-white">
                      <Flame size={13} className="text-orange-300" /> {streak}-day streak
                    </span>
                    . Keep it up and unlock your next achievement!
                  </>
                ) : (
                  'Start your first study session to build your streak!'
                )}
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => setActiveView('chat')}
                  className="bg-white text-blue-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm shadow-black/20"
                >
                  <Brain size={16} />
                  Start AI Session
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className="bg-white/10 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                >
                  View Progress
                </button>
              </div>
            </div>

            {/* Streak card */}
            <div className="hidden sm:grid grid-cols-2 gap-3 flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
                {statsLoading ? (
                  <Loader2 size={20} className="animate-spin mx-auto text-white/60" />
                ) : (
                  <div className="text-3xl font-extrabold">{streak}</div>
                )}
                <div className="text-blue-200 text-xs mt-0.5">Day Streak</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
                {statsLoading ? (
                  <Loader2 size={20} className="animate-spin mx-auto text-white/60" />
                ) : (
                  <div className="text-3xl font-extrabold">{weeklyProgress}<span className="text-lg">%</span></div>
                )}
                <div className="text-blue-200 text-xs mt-0.5">Weekly Goal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>

        {/* Activity + Recommended lessons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Activity */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Your Stats</h2>
              <button
                onClick={() => setActiveView('analytics')}
                className="text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-0.5 hover:underline"
              >
                View all <ChevronRight size={12} />
              </button>
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((act, i) => {
                  const c = COLOR[act.color];
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                        <act.icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{act.text}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{act.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommended Lessons */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Recommended Lessons</h2>
              <button
                onClick={() => setActiveView('planner')}
                className="text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-0.5 hover:underline"
              >
                See all <ArrowRight size={12} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LESSONS.map((lesson, i) => (
                <LessonCard key={i} lesson={lesson} onStart={(l) => goToChat ? goToChat(`${l.title} (${l.subject})`) : setActiveView('chat')} />
              ))}
            </div>
          </div>
        </div>

        {/* AI quick-action strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: MessageSquare, label: 'Ask AI Tutor', sub: 'Get instant explanations', color: 'red', gradient: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10', border: 'border-blue-100 dark:border-blue-900/40', view: 'chat' },
            { icon: BookOpen, label: 'Generate Notes', sub: 'Summarise any topic fast', color: 'red', gradient: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10', border: 'border-blue-100 dark:border-blue-900/40', view: 'planner' },
            { icon: Target, label: "Set Today's Goal", sub: 'Track daily objectives', color: 'emerald', gradient: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10', border: 'border-emerald-100 dark:border-emerald-900/40', view: 'planner' },
          ].map((item) => {
            const c = COLOR[item.color];
            return (
              <button
                key={item.label}
                onClick={() => setActiveView(item.view)}
                className={`flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-br ${item.gradient} ${item.border} hover:shadow-sm transition-all duration-200 text-left group`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon} group-hover:scale-110 transition-transform duration-200`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.sub}</p>
                </div>
                <ChevronRight size={14} className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </button>
            );
          })}
        </div>

        {/* About Us */}
        <div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-900/10 dark:to-violet-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-sm">
              <GraduationCap size={17} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">About Us</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">University of Lahore — 4th Semester Project 🇵🇰</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
            EduAI is a semester project built by passionate Computer Science students at the
            <span className="font-semibold text-blue-600 dark:text-blue-400"> University of Lahore</span>.
            Our mission: make quality AI-powered education accessible to every Pakistani student — from Class 1 all the way to PhD.
          </p>
          <div className="flex items-center gap-1.5 mb-4">
            <Users size={13} className="text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Meet the Team</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
            {TEAM.map((member) => (
              <div key={member.name} className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 text-center hover:shadow-sm transition-shadow">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-lg shadow-sm`}>
                  {member.emoji}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{member.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
