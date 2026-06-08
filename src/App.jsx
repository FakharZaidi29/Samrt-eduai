import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import StudyPlanner from './components/StudyPlanner';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import AuthPage from './pages/AuthPage.jsx';
import { Loader2 } from 'lucide-react';

function AppInner() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(user?.settings?.darkMode || false);

  if (loading) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-red-500 animate-spin" />
          <p className="text-zinc-400 text-sm">Loading EduAI…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // return <AuthPage />;
  }

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen`}>
      <Layout
        activeView={activeView}
        setActiveView={setActiveView}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      >
        {activeView === 'dashboard' && <Dashboard setActiveView={setActiveView} />}
        {activeView === 'chat' && <ChatInterface />}
        {activeView === 'planner' && <StudyPlanner setActiveView={setActiveView} />}
        {activeView === 'analytics' && <Analytics />}
        {activeView === 'settings' && (
          <Settings
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}
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
