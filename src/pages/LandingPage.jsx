import { useState } from 'react';
import {
  Sparkles, Brain, BookOpen, BarChart3, MessageSquare,
  ArrowRight, Play, Star, Zap, Shield, Globe, ChevronRight,
  GraduationCap, Target, Clock, Users, Trophy, PenTool,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Tutor',
    desc: 'Get instant explanations, step-by-step solutions, and personalized help on any topic — from calculus to coding.',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-900/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: BookOpen,
    title: 'Smart Study Planner',
    desc: 'AI generates a custom learning roadmap based on your topic, level, and timeline. Track every module.',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-900/20',
    iconColor: 'text-violet-400',
  },
  {
    icon: Trophy,
    title: 'Challenge Mode',
    desc: 'Compete in AI-graded quizzes across subjects. Get marks, grades, and instant feedback on every answer.',
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-900/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: PenTool,
    title: 'Practice Questions',
    desc: 'Submit your answers and let AI review, rate, and provide detailed feedback to improve your understanding.',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-900/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Play,
    title: 'Video Learning',
    desc: 'Curated YouTube videos recommended by AI to reinforce concepts visually — right inside the chat.',
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-900/20',
    iconColor: 'text-rose-400',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    desc: 'Track study hours, completed modules, AI interactions, and weekly goals in one clear dashboard.',
    gradient: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-900/20',
    iconColor: 'text-indigo-400',
  },
];

const STATS = [
  { value: '50K+', label: 'Students', icon: Users },
  { value: '98%', label: 'Satisfaction', icon: Star },
  { value: '24/7', label: 'AI Available', icon: Zap },
  { value: '100+', label: 'Subjects', icon: Globe },
];

const SAMPLE_CHAT = [
  { role: 'user', text: 'Can you explain the chain rule in calculus?' },
  { role: 'ai', text: '**The Chain Rule** lets you differentiate composite functions.\n\n**Formula:** d/dx[f(g(x))] = f\'(g(x)) · g\'(x)\n\n**Example:** Differentiate h(x) = (x² + 3)⁵\n- Outer: f(u) = u⁵ → f\'(u) = 5u⁴\n- Inner: g(x) = x² + 3 → g\'(x) = 2x\n\n**Result:** h\'(x) = 10x(x² + 3)⁴' },
];

export default function LandingPage({ onGetStarted, onLogin }) {
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">EduAI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
          >
            Sign in
          </button>
          <button
            onClick={onGetStarted}
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl transition-colors shadow-lg shadow-blue-900/30"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 text-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-8 animate-fadeIn animate-pulse-glow">
            <Zap size={13} className="text-blue-400" />
            AI-Powered Education Platform for Pakistan 🇵🇰
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fadeInUp">
            Learn Smarter
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-shimmer" style={{backgroundSize:'200% auto'}}>
              with AI
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeInUp delay-200">
            Your personal AI tutor that explains concepts, creates custom study plans,
            finds educational videos, and tracks your progress — Class 1 to PhD, for every Pakistani student.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fadeInUp delay-300">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-blue-900/40 hover:shadow-blue-900/60 hover:scale-105"
            >
              <GraduationCap size={18} />
              Start Learning Free
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setChatVisible(true)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-2xl transition-all duration-200"
            >
              <Play size={16} className="text-blue-400" />
              See AI in Action
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fadeInUp delay-400">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-all duration-200">
                <div className="text-2xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample Chat Preview ──────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-12 max-w-3xl mx-auto">
        <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-slate-800/50 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">EduAI Tutor</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-xs text-slate-400">Online · Ready to help</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="p-5 space-y-4">
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs text-sm">
                Can you explain the chain rule in calculus?
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center flex-shrink-0">
                <Sparkles size={13} className="text-white" />
              </div>
              <div className="bg-slate-800 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 max-w-sm text-sm text-slate-200 leading-relaxed">
                <p className="font-semibold text-white mb-1">The Chain Rule</p>
                <p className="text-slate-300 text-xs mb-2">Differentiate composite functions: d/dx[f(g(x))] = f'(g(x)) · g'(x)</p>
                <p className="text-blue-400 text-xs font-medium">Example: h(x) = (x² + 3)⁵ → h'(x) = 10x(x² + 3)⁴ ✓</p>
              </div>
            </div>
          </div>

          <div className="px-5 pb-4">
            <button
              onClick={onGetStarted}
              className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-sm font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={14} />
              Start your own conversation
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need to
            <span className="text-blue-400"> excel</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Powerful AI tools designed specifically for students who want to learn faster and retain more.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group bg-slate-900 border border-white/5 hover:border-white/15 rounded-3xl p-7 transition-all duration-300 hover:shadow-xl cursor-pointer animate-fadeInUp"
              onClick={onGetStarted}
            >
              <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-5`}>
                <f.icon size={22} className={f.iconColor} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              <div className="flex items-center gap-1 mt-4 text-blue-400 text-xs font-semibold group-hover:gap-2 transition-all">
                Try it now <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-slate-400 mb-14">Get started in seconds, no setup required.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Shield, title: 'Create Account', desc: 'Sign up free in seconds. No credit card needed.' },
              { step: '02', icon: MessageSquare, title: 'Ask Anything', desc: 'Chat with your AI tutor about any subject or topic.' },
              { step: '03', icon: Target, title: 'Track Progress', desc: 'Follow your study plan and watch your knowledge grow.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                    <s.icon size={24} className="text-blue-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pakistan Education Levels ────────────────────────────── */}
      <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Designed for <span className="text-blue-400">Every Pakistani Learner</span>
          </h2>
          <p className="text-slate-400">From Class 1 to PhD — EduAI supports your entire education journey</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {[
            { label: 'Class 1-5', emoji: '📚', color: 'from-emerald-500 to-teal-600' },
            { label: 'Class 6-8', emoji: '✏️', color: 'from-blue-500 to-cyan-600' },
            { label: 'Matric', emoji: '🎓', color: 'from-violet-500 to-purple-600' },
            { label: 'FSc / FA', emoji: '🔬', color: 'from-rose-500 to-pink-600' },
            { label: 'BA / BS', emoji: '🏛️', color: 'from-amber-500 to-orange-500' },
            { label: 'Masters / MPhil', emoji: '📖', color: 'from-blue-600 to-indigo-700' },
            { label: 'PhD / Teachers', emoji: '🏆', color: 'from-slate-600 to-slate-800' },
          ].map(l => (
            <button key={l.label} onClick={onGetStarted}
              className="flex flex-col items-center gap-2 p-4 bg-slate-900 border border-white/10 rounded-2xl hover:border-blue-500/40 hover:bg-slate-800 transition-all duration-200 text-center">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center text-xl`}>{l.emoji}</div>
              <span className="text-xs font-medium text-slate-300 leading-tight">{l.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-violet-900/20 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/50">
            <Sparkles size={28} className="text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Ready to learn smarter?
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join thousands of students already using EduAI to master any subject with the power of AI.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-blue-900/40 hover:scale-105 text-lg"
          >
            <GraduationCap size={22} />
            Start Learning for Free
          </button>
          <p className="text-slate-600 text-sm mt-4">No credit card required · Free forever plan</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white">EduAI</span>
        </div>
        <p className="text-xs text-slate-600">© 2026 EduAI. AI-powered learning platform.</p>
      </footer>
    </div>
  );
}
