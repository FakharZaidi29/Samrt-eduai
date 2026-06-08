import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Sparkles,
  BarChart3,
  Bell,
  LogOut,
  Trophy,
  PenTool,
  CreditCard,
  Zap,
  Flame,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chat', label: 'AI Tutor', icon: MessageSquare, badge: 'AI' },
  { id: 'planner', label: 'Study Planner', icon: BookOpen },
  { id: 'competition', label: 'Challenge Mode', icon: Trophy, badge: 'NEW' },
  { id: 'practice', label: 'Practice Questions', icon: PenTool },
  { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
];

const BOTTOM_NAV = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'pricing', label: 'Upgrade Plan', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function NavItem({ item, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 group
        ${isActive
          ? 'bg-blue-600 text-white shadow-sm shadow-blue-200/60 dark:shadow-blue-900/40'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
        }
      `}
    >
      <item.icon size={17} className="flex-shrink-0" />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge && (
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'}`}>
          {item.badge}
        </span>
      )}
    </button>
  );
}

function NotificationsPanel({ user, onClose, setActiveView }) {
  const creditsLeft = (user?.aiCreditsLimit || 500) - (user?.aiCreditsUsed || 0);
  const creditsUsedPct = ((user?.aiCreditsUsed || 0) / (user?.aiCreditsLimit || 500)) * 100;
  const streak = user?.streak || 0;

  const notifications = [
    creditsUsedPct >= 80 && {
      id: 'credits',
      icon: Zap,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      title: 'Credits Running Low',
      body: `Only ${creditsLeft} credits left. Upgrade to keep learning!`,
      action: () => { setActiveView('pricing'); onClose(); },
      actionLabel: 'Upgrade Now',
      dot: 'bg-amber-400',
    },
    streak === 0 && {
      id: 'streak',
      icon: Flame,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-500',
      title: 'Start Your Streak!',
      body: 'Open a chat session today to begin your learning streak.',
      action: () => { setActiveView('chat'); onClose(); },
      actionLabel: 'Start Learning',
      dot: 'bg-orange-400',
    },
    streak > 0 && streak < 3 && {
      id: 'streak-low',
      icon: Flame,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-500',
      title: `${streak}-Day Streak 🔥`,
      body: 'Keep it going! Study today to maintain your streak.',
      action: () => { setActiveView('chat'); onClose(); },
      actionLabel: 'Study Now',
      dot: 'bg-orange-400',
    },
    streak >= 3 && {
      id: 'streak-good',
      icon: Flame,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-500',
      title: `${streak}-Day Streak! 🔥`,
      body: "You're on fire! Keep studying every day.",
      action: null,
      dot: 'bg-emerald-400',
    },
    {
      id: 'challenge',
      icon: Trophy,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      title: 'Try Challenge Mode!',
      body: 'Test your knowledge with AI-graded quizzes. Get marks & grades.',
      action: () => { setActiveView('competition'); onClose(); },
      actionLabel: 'Start Quiz',
      dot: 'bg-yellow-400',
    },
    {
      id: 'welcome',
      icon: Info,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'Welcome to EduAI!',
      body: 'All subjects covered — Class 1 to PhD. Ask anything, anytime.',
      action: null,
      dot: 'bg-blue-400',
    },
  ].filter(Boolean);

  return (
    <div className="absolute top-0 left-full ml-2 z-50 w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/30 overflow-hidden animate-fadeIn">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">{notifications.length}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-zinc-800">
        {notifications.map(n => (
          <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${n.iconBg}`}>
              <n.icon size={14} className={n.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${n.dot}`} />
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{n.body}</p>
              {n.action && (
                <button onClick={n.action} className="mt-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  {n.actionLabel} →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">EduAI · Smart Learning Platform</p>
      </div>
    </div>
  );
}

export default function Sidebar({ activeView, setActiveView, darkMode, setDarkMode }) {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const creditsLeft = (user?.aiCreditsLimit || 500) - (user?.aiCreditsUsed || 0);
  const hasUrgent = creditsLeft < 100 || (user?.streak || 0) === 0;

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-zinc-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm shadow-blue-200 dark:shadow-blue-900">
          <Sparkles size={17} className="text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-none">EduAI</p>
            <span className="text-sm" title="Pakistan">🇵🇰</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Smart Learning Platform</p>
        </div>

        {/* Bell with notifications panel */}
        <div className="ml-auto relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors relative"
          >
            <Bell size={16} />
            <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${hasUrgent ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          </button>
          {notifOpen && (
            <NotificationsPanel
              user={user}
              onClose={() => setNotifOpen(false)}
              setActiveView={setActiveView}
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 px-3 pb-2 uppercase tracking-widest">Learning</p>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} isActive={activeView === item.id} onClick={setActiveView} />
        ))}

        <div className="pt-5">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 px-3 pb-2 uppercase tracking-widest">Account</p>
          {BOTTOM_NAV.map((item) => (
            <NavItem key={item.id} item={item} isActive={activeView === item.id} onClick={setActiveView} />
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-3 pt-3 pb-4 border-t border-slate-100 dark:border-zinc-800 space-y-1">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
        >
          {darkMode ? <Sun size={17} className="flex-shrink-0" /> : <Moon size={17} className="flex-shrink-0" />}
          <span className="flex-1 text-left">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          <div className={`w-9 h-5 rounded-full transition-colors duration-300 flex items-center px-0.5 flex-shrink-0 ${darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-zinc-700'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user?.email || ''}</p>
          </div>
          <button onClick={logout} title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex-shrink-0">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
