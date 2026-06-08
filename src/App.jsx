import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import StudyPlanner from './components/StudyPlanner';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import CompetitionMode from './components/CompetitionMode.jsx';
import PracticeQuestions from './components/PracticeQuestions.jsx';
import Pricing from './components/Pricing.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AuthModal from './pages/AuthModal.jsx';
import { Loader2 } from 'lucide-react';

function AppInner() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [chatTopic, setChatTopic] = useState(null);

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
    <div className={`${darkMode ? 'dark' : ''} h-screen`}>
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
      </Layout>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
