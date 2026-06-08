import { useState } from 'react';
import { Sparkles, Eye, EyeOff, Loader2, Zap, X, CheckCircle2, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
      <path d="M6.3 14.7l7 5.1C15.1 16 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.9 6.3 14.7z" fill="#FF3D00"/>
      <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.5C29.5 36.2 26.9 37 24 37c-6.1 0-10.7-3.1-11.8-7.5l-7 5.4C8.5 41.3 15.7 45 24 45z" fill="#4CAF50"/>
      <path d="M44.5 20H24v8.5h11.8c-.6 2.5-2 4.7-4 6.3l6.6 5.5C42.1 37 45 31 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
    </svg>
  );
}

const DEMO_EMAIL = 'demo@eduai.com';
const DEMO_PASSWORD = 'demo123';

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleMsg, setGoogleMsg] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setError('Please enter your email address'); return; }
    setError('');
    setLoading(true);
    try {
      await api.auth.forgotPassword(forgotEmail.trim());
      setForgotSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
    } catch {
      setError('Demo account not ready. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && !name.trim()) { setError('Please enter your name'); return; }
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (forgotMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="relative w-full max-w-sm animate-[fadeIn_0.15s_ease-out]">
          {onClose && (
            <button onClick={onClose} className="absolute -top-10 right-0 p-2 rounded-xl text-white/60 hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/50 mb-4">
              <Mail size={26} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Forgot Password?</h1>
            <p className="text-sm text-slate-400 mt-1">We'll send a reset link to your email</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            {forgotSent ? (
              <div className="text-center py-4">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Email sent!</p>
                <p className="text-sm text-slate-400 mb-4">Check your inbox and click the reset link. It expires in 1 hour.</p>
                <button onClick={() => { setForgotMode(false); setForgotSent(false); }} className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
                  ← Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Email</label>
                  <input
                    type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/40 transition-all"
                  />
                </div>
                {error && <div className="px-4 py-3 bg-red-900/30 border border-red-800/50 rounded-xl"><p className="text-sm text-red-400">{error}</p></div>}
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <><Loader2 size={16} className="animate-spin" />Sending…</> : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => { setForgotMode(false); setError(''); }} className="w-full text-sm text-slate-400 hover:text-white transition-colors">
                  ← Back to Sign In
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm animate-[fadeIn_0.15s_ease-out]">
        {/* Close */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 p-2 rounded-xl text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/50 mb-4">
            <Sparkles size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">EduAI</h1>
          <p className="text-sm text-slate-400 mt-1">Smart Learning Platform</p>
        </div>

        {/* Demo button */}
        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 mb-3 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold rounded-2xl transition-all backdrop-blur-sm disabled:opacity-60"
        >
          <Zap size={15} className="text-yellow-400" />
          Try Demo Account — instant access
        </button>

        {/* Google Sign-in */}
        <button
          onClick={() => setGoogleMsg(true)}
          className="w-full flex items-center justify-center gap-2 mb-3 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl transition-all"
        >
          <GoogleIcon />
          Continue with Google
        </button>
        {googleMsg && (
          <p className="text-center text-xs text-amber-400 mb-3 animate-fadeIn">
            Google Sign-in coming soon — use email or demo account for now!
          </p>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-xs text-slate-500">or sign in manually</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-slate-400 mb-5">
            {mode === 'login' ? 'Sign in to continue learning' : 'Join and start learning smarter'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/40 transition-all"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
                  className="w-full px-4 py-2.5 pr-11 bg-slate-800 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/40 transition-all"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-900/30 border border-red-800/50 rounded-xl">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-900/40 disabled:opacity-60 mt-2"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" />{mode === 'login' ? 'Signing in…' : 'Creating…'}</>
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          <div className="mt-4 space-y-2 text-center">
            <p className="text-sm text-slate-400">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
            {mode === 'login' && (
              <button onClick={() => { setForgotMode(true); setError(''); setForgotEmail(email); }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Forgot password?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
