import { useState } from 'react';
import { Sparkles, Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const DEMO_EMAIL = 'demo@eduai.com';
const DEMO_PASSWORD = 'demo123';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    setMode('login');
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
    } catch (err) {
      setError('Demo account not ready. Please wait and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-800/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-900/40 mb-4">
            <Sparkles size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">EduAI</h1>
          <p className="text-sm text-zinc-400 mt-1">Smart Learning Platform</p>
        </div>

        {/* Demo button */}
        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 mb-4 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold rounded-2xl transition-all duration-150 backdrop-blur-sm disabled:opacity-60"
        >
          <Zap size={15} className="text-yellow-400" />
          Try Demo Account — instant access
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-500">or sign in manually</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-2xl shadow-black/40">
          <h2 className="text-lg font-bold text-white mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            {mode === 'login'
              ? 'Sign in to continue your learning journey'
              : 'Join thousands of students learning smarter'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  autoComplete="name"
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-900/40 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-900/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-2.5 pr-11 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-900/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
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
              className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-red-900/40 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-zinc-400">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={toggleMode}
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
