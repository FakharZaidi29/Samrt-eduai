import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Zap,
  Check,
  Loader2,
  HeadphonesIcon,
  MessageSquare,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { api } from '../services/api.js';

const FAQS = [
  { q: 'How many AI credits do I get per day?', a: 'Free plan includes 500 lifetime credits. Upgrade to Basic for 2,000/month or Premium for unlimited usage.' },
  { q: 'Can I use EduAI for board exam preparation?', a: 'Yes! EduAI is designed for Pakistani board exams — Matric, FSc, and more. Just tell the AI your level and it adjusts automatically.' },
  { q: 'How does the streak system work?', a: 'Open any AI chat session each day to maintain your streak. Missing a day resets it to 1.' },
  { q: 'Can I download my study notes?', a: 'Yes! Open any module in the Study Planner, generate notes, then click the Download button to save as a .txt file.' },
  { q: 'Is my data safe?', a: 'All your data is stored securely on MongoDB Atlas with encrypted connections. We never share your data with third parties.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-zinc-800 last:border-0">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between gap-3 py-3.5 text-left">
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{q}</span>
        {open ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
      </button>
      {open && <p className="text-xs text-slate-500 dark:text-slate-400 pb-3.5 leading-relaxed">{a}</p>}
    </div>
  );
}

function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`rounded-full transition-colors duration-300 flex items-center px-0.5 flex-shrink-0 ${
        enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-zinc-700'
      }`}
      style={{ height: '22px', minWidth: '40px' }}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
          enabled ? 'translate-x-[18px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-slate-100 dark:border-zinc-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        {description && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Icon size={14} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h2>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

export default function Settings({ darkMode, setDarkMode }) {
  const { user, updateUser } = useAuth();
  const { lang, setLang } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [eduLevel, setEduLevel] = useState(user?.settings?.educationLevel || 'Matric (9-10)');
  const [language, setLanguage] = useState(user?.settings?.language || lang);
  const [notifs, setNotifs] = useState({
    email: user?.settings?.emailNotifications ?? true,
    push: user?.settings?.pushNotifications ?? false,
    reminders: user?.settings?.studyReminders ?? true,
    weekly: user?.settings?.weeklyReport ?? true,
  });
  const [aiModel, setAiModel] = useState(user?.settings?.aiModel || 'claude-sonnet-4-6');
  const [autoSave, setAutoSave] = useState(user?.settings?.autoSaveNotes ?? true);
  const [soundFx, setSoundFx] = useState(user?.settings?.soundEffects ?? false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleDarkModeToggle = (val) => {
    setDarkMode(val);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    try {
      const updatedUser = await api.auth.updateSettings({
        name,
        educationLevel: eduLevel,
        language,
        darkMode,
        emailNotifications: notifs.email,
        pushNotifications: notifs.push,
        studyReminders: notifs.reminders,
        weeklyReport: notifs.weekly,
        aiModel,
        autoSaveNotes: autoSave,
        soundEffects: soundFx,
      });
      updateUser(updatedUser);
      setLang(language); // sync language context immediately
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-5 pb-10">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your account preferences and app settings
          </p>
        </div>

        {/* Profile */}
        <SectionCard title="Profile" icon={User}>
          <SettingRow label="Full Name" description="Your display name across the platform">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-40 px-3 py-1.5 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
            />
          </SettingRow>
          <SettingRow label="Email" description="Used for login and notifications">
            <input
              type="email"
              defaultValue={user?.email || ''}
              readOnly
              className="w-44 px-3 py-1.5 text-sm bg-slate-100 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
            />
          </SettingRow>
          <SettingRow label="Education Level" description="Your current class / degree level in Pakistan">
            <select
              value={eduLevel}
              onChange={e => setEduLevel(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-400 transition-colors cursor-pointer"
            >
              {['Class 1-5 (Primary)','Class 6-8 (Middle)','Matric (9-10)','FSc / FA (11-12)','BA / BS','Masters / MPhil','PhD','Teacher / Educator'].map(l => <option key={l}>{l}</option>)}
            </select>
          </SettingRow>
          <SettingRow label="Language / زبان" description="App display language and AI response language">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-400 transition-colors cursor-pointer"
            >
              <option value="en">English</option>
              <option value="ur">اردو (Urdu)</option>
            </select>
          </SettingRow>
        </SectionCard>

        {/* Appearance */}
        <SectionCard title="Appearance" icon={Palette}>
          <SettingRow label="Dark Mode" description="Switch between light and dark theme">
            <ToggleSwitch enabled={darkMode} onChange={handleDarkModeToggle} />
          </SettingRow>
          <SettingRow label="Sound Effects" description="Play sounds on actions and notifications">
            <ToggleSwitch enabled={soundFx} onChange={setSoundFx} />
          </SettingRow>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications" icon={Bell}>
          <SettingRow label="Email Notifications" description="Receive updates via email">
            <ToggleSwitch enabled={notifs.email} onChange={(v) => setNotifs((p) => ({ ...p, email: v }))} />
          </SettingRow>
          <SettingRow label="Push Notifications" description="Browser push alerts">
            <ToggleSwitch enabled={notifs.push} onChange={(v) => setNotifs((p) => ({ ...p, push: v }))} />
          </SettingRow>
          <SettingRow label="Study Reminders" description="Daily reminder to study">
            <ToggleSwitch enabled={notifs.reminders} onChange={(v) => setNotifs((p) => ({ ...p, reminders: v }))} />
          </SettingRow>
          <SettingRow label="Weekly Report" description="Get your weekly progress summary">
            <ToggleSwitch enabled={notifs.weekly} onChange={(v) => setNotifs((p) => ({ ...p, weekly: v }))} />
          </SettingRow>
        </SectionCard>

        {/* AI Preferences */}
        <SectionCard title="AI Preferences" icon={Zap}>
          <SettingRow label="AI Model" description="Choose the model powering your tutor">
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-colors cursor-pointer"
            >
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6 (Fast)</option>
              <option value="claude-opus-4-5">Claude Opus 4.5 (Best)</option>
              <option value="claude-haiku-4-5">Claude Haiku 4.5 (Lite)</option>
            </select>
          </SettingRow>
          <SettingRow label="Auto-save Notes" description="Automatically save AI-generated notes">
            <ToggleSwitch enabled={autoSave} onChange={setAutoSave} />
          </SettingRow>
        </SectionCard>

        {/* Security */}
        <SectionCard title="Security" icon={Shield}>
          <SettingRow label="Change Password" description="Update your account password">
            <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Change
            </button>
          </SettingRow>
          <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security">
            <button className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
              Enable
            </button>
          </SettingRow>
          <SettingRow label="Delete Account" description="Permanently remove your account and data">
            <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Delete
            </button>
          </SettingRow>
        </SectionCard>

        {/* Support */}
        <SectionCard title="Support" icon={HeadphonesIcon}>
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">Having trouble? Reach out to our team — we're here to help.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="mailto:support@eduai.pk"
                className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl hover:shadow-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Email Support</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">support@eduai.pk</p>
                </div>
                <ExternalLink size={12} className="ml-auto text-slate-300 group-hover:text-blue-400 transition-colors" />
              </a>
              <button
                onClick={() => { window.open('https://wa.me/923001234567?text=Hi%20EduAI%20Support', '_blank'); }}
                className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl hover:shadow-sm transition-all group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">WhatsApp</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Chat with us directly</p>
                </div>
                <ExternalLink size={12} className="ml-auto text-slate-300 group-hover:text-emerald-400 transition-colors" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Frequently Asked Questions</p>
              {FAQS.map((faq) => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
            </div>

            <div className="mt-3 p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                🇵🇰 Built by students of <span className="font-semibold text-slate-700 dark:text-slate-300">University of Lahore</span> · 4th Semester
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Save error */}
        {saveError && (
          <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-red-200 dark:border-red-900/40 rounded-xl">
            <p className="text-sm text-blue-600 dark:text-blue-400">{saveError}</p>
          </div>
        )}

        {/* Save success */}
        {saveSuccess && (
          <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check size={14} /> Settings saved successfully!
            </p>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200/50 dark:shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Check size={16} />
              Save Changes
            </>
          )}
        </button>

      </div>
    </div>
  );
}
