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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chat', label: 'AI Tutor', icon: MessageSquare, badge: 'AI' },
  { id: 'planner', label: 'Study Planner', icon: BookOpen },
  { id: 'competition', label: 'Challenge Mode', icon: Trophy, badge: 'NEW' },
  { id: 'practice', label: 'Practice Questions', icon: PenTool },
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
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
            isActive
              ? 'bg-white/20 text-white'
              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
          }`}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ activeView, setActiveView, darkMode, setDarkMode }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-zinc-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm shadow-red-200 dark:shadow-red-900">
          <Sparkles size={17} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm leading-none">EduAI</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Smart Learning Platform</p>
        </div>
        <button className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 px-3 pb-2 uppercase tracking-widest">
          Learning
        </p>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            onClick={setActiveView}
          />
        ))}

        <div className="pt-5">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 px-3 pb-2 uppercase tracking-widest">
            Account
          </p>
          {BOTTOM_NAV.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeView === item.id}
              onClick={setActiveView}
            />
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-3 pt-3 pb-4 border-t border-slate-100 dark:border-zinc-800 space-y-1">
        {/* Dark mode toggle */}
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

        {/* User profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user?.email || ''}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex-shrink-0"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
