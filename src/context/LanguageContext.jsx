import { createContext, useContext, useState, useEffect } from 'react';

const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    aiTutor: 'AI Tutor',
    studyPlanner: 'Study Planner',
    challengeMode: 'Challenge Mode',
    practiceQuestions: 'Practice Questions',
    leaderboard: 'Leaderboard',
    analytics: 'Analytics',
    upgradePlan: 'Upgrade Plan',
    settings: 'Settings',
    welcome: 'Welcome back',
    todayStreak: 'Day Streak',
    creditsLeft: 'Credits Left',
    totalChats: 'Total Chats',
    weeklyGoal: 'Weekly Goal',
    recentActivity: 'Recent Activity',
    recommendedLessons: 'Recommended Lessons',
    startLearning: 'Start Learning',
    continueLearning: 'Continue Learning',
    askAiTutor: 'Ask AI Tutor',
    generateNotes: 'Generate Notes',
    setTodayGoal: "Set Today's Goal",
    aboutUs: 'About Us',
    meetTheTeam: 'Meet the Team',
    saveChanges: 'Save Changes',
    notifications: 'Notifications',
    appearance: 'Appearance',
    aiPreferences: 'AI Preferences',
    security: 'Security',
    support: 'Support',
    noActivity: 'No recent activity yet',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    signOut: 'Sign out',
    newChat: 'New Chat',
    send: 'Send',
    typeMessage: 'Ask anything…',
  },
  ur: {
    dashboard: 'ڈیش بورڈ',
    aiTutor: 'اے آئی استاد',
    studyPlanner: 'مطالعہ منصوبہ',
    challengeMode: 'چیلنج موڈ',
    practiceQuestions: 'مشق سوالات',
    leaderboard: 'لیڈر بورڈ',
    analytics: 'تجزیات',
    upgradePlan: 'اپ گریڈ پلان',
    settings: 'ترتیبات',
    welcome: 'خوش آمدید',
    todayStreak: 'دن کی اسٹریک',
    creditsLeft: 'کریڈٹس باقی',
    totalChats: 'کل گفتگو',
    weeklyGoal: 'ہفتہ وار ہدف',
    recentActivity: 'حالیہ سرگرمی',
    recommendedLessons: 'تجویز کردہ اسباق',
    startLearning: 'سیکھنا شروع کریں',
    continueLearning: 'سیکھتے رہیں',
    askAiTutor: 'اے آئی سے پوچھیں',
    generateNotes: 'نوٹس بنائیں',
    setTodayGoal: 'آج کا ہدف مقرر کریں',
    aboutUs: 'ہمارے بارے میں',
    meetTheTeam: 'ٹیم سے ملیں',
    saveChanges: 'تبدیلیاں محفوظ کریں',
    notifications: 'اطلاعات',
    appearance: 'ظاہری شکل',
    aiPreferences: 'اے آئی ترجیحات',
    security: 'سیکیورٹی',
    support: 'سپورٹ',
    noActivity: 'ابھی تک کوئی سرگرمی نہیں',
    lightMode: 'روشن موڈ',
    darkMode: 'تاریک موڈ',
    signOut: 'سائن آؤٹ',
    newChat: 'نئی گفتگو',
    send: 'بھیجیں',
    typeMessage: 'کچھ بھی پوچھیں…',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('eduai_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('eduai_lang', lang);
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'ur' ? 'ur' : 'en';
  }, [lang]);

  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isUrdu: lang === 'ur' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
