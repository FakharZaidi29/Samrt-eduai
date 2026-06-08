import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';
import { useNotifications } from './hooks/useNotifications.js';
import { useOffline } from './hooks/useOffline.js';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import StudyPlanner from './components/StudyPlanner';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import CompetitionMode from './components/CompetitionMode.jsx';
import PracticeQuestions from './components/PracticeQuestions.jsx';
import Pricing from './components/Pricing.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AuthModal from './pages/AuthModal.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import { Loader2, WifiOff } from 'lucide-react';

function AppInner() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState('dashboard');

  // Handle /reset-password/:token URL
  const resetMatch = window.location.pathname.match(/^\/reset-password\/([a-f0-9]{64})$/);
  if (resetMatch) {
    return <ResetPassword token={resetMatch[1]} onDone={() => window.history.replaceState({}, '', '/')} />;
  }
  const [darkMode, setDarkMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [chatTopic, setChatTopic] = useState(null);
  const offline = useOffline();
  const { send: sendNotif } = useNotifications(user);

  // Daily streak reminder — fires once per session after 2 min if user hasn't chatted
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      sendNotif('📚 Time to Study!', `Hey ${user.name?.split(' ')[0] || 'there'}, keep your streak going — open EduAI and learn something new today!`);
    }, 2 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [user]);

  const goToChat = (topic = null) => {
    setChatTopic(topic);
    setActiveView('chat');
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading EduAI…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage
          onGetStarted={() => setShowAuth(true)}
          onLogin={() => setShowAuth(true)}
        />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col`}>
      {/* Offline banner */}
      {offline && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium z-50 flex-shrink-0">
          <WifiOff size={15} />
          <span>{t('offlineBanner')}</span>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <Layout
          activeView={activeView}
          setActiveView={setActiveView}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        >
          {activeView === 'dashboard' && <Dashboard setActiveView={setActiveView} goToChat={goToChat} />}
          {activeView === 'chat' && <ChatInterface initialTopic={chatTopic} onTopicConsumed={() => setChatTopic(null)} />}
          {activeView === 'planner' && <StudyPlanner setActiveView={setActiveView} />}
          {activeView === 'analytics' && <Analytics />}
          {activeView === 'settings' && <Settings darkMode={darkMode} setDarkMode={setDarkMode} />}
          {activeView === 'competition' && <CompetitionMode />}
          {activeView === 'practice' && <PracticeQuestions />}
          {activeView === 'pricing' && <Pricing setActiveView={setActiveView} />}
          {activeView === 'leaderboard' && <Leaderboard />}
        </Layout>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </LanguageProvider>
  );
}
