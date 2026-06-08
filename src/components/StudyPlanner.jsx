import { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  ChevronRight,
  Play,
  Loader2,
  Plus,
  FileText,
  Zap,
  BarChart2,
  Calendar,
  ArrowRight,
  Trash2,
  StickyNote,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../services/api.js';

const DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced'];
const DURATION = ['1 week', '2 weeks', '1 month', '3 months'];

const STATUS = {
  completed: {
    label: 'Completed',
    Icon: CheckCircle2,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    cardBg: 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    actionBg: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  },
  'in-progress': {
    label: 'In Progress',
    Icon: Play,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    cardBg: 'bg-white dark:bg-zinc-900 border-blue-200 dark:border-blue-900',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dot: 'bg-blue-500',
    actionBg: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  upcoming: {
    label: 'Upcoming',
    Icon: Circle,
    iconBg: 'bg-slate-100 dark:bg-zinc-800',
    iconColor: 'text-slate-400 dark:text-slate-500',
    cardBg: 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800',
    badge: 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400',
    dot: 'bg-slate-300 dark:bg-zinc-600',
    actionBg: 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-400',
  },
};

function renderNotes(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;
    if (trimmed.startsWith('## ')) return <h3 key={i} className="font-bold text-slate-900 dark:text-white text-sm mt-3 mb-1">{trimmed.slice(3)}</h3>;
    if (trimmed.startsWith('# ')) return <h2 key={i} className="font-bold text-slate-900 dark:text-white text-base mt-4 mb-1">{trimmed.slice(2)}</h2>;
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      return (
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
          <span className="text-xs text-slate-700 dark:text-slate-300">{trimmed.slice(2)}</span>
        </div>
      );
    }
    const bold = trimmed.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith('**') && p.endsWith('**') && p.length > 4
        ? <strong key={j} className="font-semibold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>
        : p
    );
    return <p key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed my-0.5">{bold}</p>;
  });
}

function ModuleCard({ module, index, onStatusChange, onNotesSaved, planId }) {
  const [expanded, setExpanded] = useState(module.status === 'in-progress');
  const [updating, setUpdating] = useState(false);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [showNotes, setShowNotes] = useState(!!module.notes);
  const [notes, setNotes] = useState(module.notes || '');
  const [copied, setCopied] = useState(false);
  const s = STATUS[module.status] || STATUS.upcoming;

  const handleComplete = async (e) => {
    e.stopPropagation();
    if (updating || module.status === 'completed') return;
    setUpdating(true);
    try { await onStatusChange(planId, module._id, 'completed'); }
    finally { setUpdating(false); }
  };

  const handleStart = async (e) => {
    e.stopPropagation();
    if (updating || module.status !== 'upcoming') return;
    setUpdating(true);
    try { await onStatusChange(planId, module._id, 'in-progress'); }
    finally { setUpdating(false); }
  };

  const handleGenerateNotes = async (e) => {
    e.stopPropagation();
    if (generatingNotes) return;
    setGeneratingNotes(true);
    setShowNotes(true);
    try {
      const session = await api.chat.createSession(`Notes: ${module.title}`);
      const topicList = (module.topics || []).join(', ');
      const prompt = `Generate concise, well-structured study notes for the module: "${module.title}".
Topics covered: ${topicList}

Format the notes with:
# Module Overview
- Key points

## Topic breakdowns with explanations
- Bullet points for each concept
- Important formulas or definitions in **bold**
- Examples where helpful

Keep it student-friendly, clear, and comprehensive. About 300-400 words.`;
      const data = await api.chat.sendMessage(session._id, prompt);
      const generatedNotes = data.message.content;
      setNotes(generatedNotes);
      await onNotesSaved(planId, module._id, generatedNotes);
    } catch (err) {
      console.error('Notes generation error:', err.message);
      setNotes('Failed to generate notes. Please try again.');
    } finally {
      setGeneratingNotes(false);
    }
  };

  const handleCopyNotes = () => {
    if (!notes) return;
    navigator.clipboard.writeText(notes).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`border rounded-2xl transition-all duration-200 ${s.cardBg} ${module.status === 'in-progress' ? 'shadow-sm' : ''}`}>
      <div className="flex items-center gap-4 p-4 cursor-pointer select-none" onClick={() => setExpanded(v => !v)}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
          <s.Icon size={16} className={s.iconColor} fill={module.status === 'completed' ? 'currentColor' : 'none'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Module {index + 1}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
            {notes && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">📝 Notes</span>}
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{module.title}</h3>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <Clock size={11} />
            <span>{module.duration}</span>
          </div>
          <ChevronRight size={15} className={`text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Topics</p>
              <div className="space-y-1.5">
                {(module.topics || []).map((topic, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Resources</p>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <FileText size={13} className="text-slate-400" />
                  <span>{module.resources || 3} learning materials included</span>
                </div>
              </div>

              {module.status === 'completed' ? (
                <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 size={13} fill="currentColor" /> Module completed
                </div>
              ) : module.status === 'in-progress' ? (
                <button onClick={handleComplete} disabled={updating}
                  className={`mt-4 w-full py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${s.actionBg} disabled:opacity-60`}>
                  {updating ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                  Mark Complete
                </button>
              ) : (
                <button onClick={handleStart} disabled={updating}
                  className={`mt-4 w-full py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${s.actionBg} disabled:opacity-60`}>
                  {updating ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} fill="currentColor" />}
                  Start Module
                </button>
              )}
            </div>
          </div>

          {/* Notes section */}
          <div className="border-t border-slate-100 dark:border-zinc-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <StickyNote size={11} /> AI Study Notes
              </p>
              <div className="flex items-center gap-2">
                {notes && (
                  <button onClick={handleCopyNotes}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
                <button
                  onClick={handleGenerateNotes}
                  disabled={generatingNotes}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60">
                  {generatingNotes ? <><Loader2 size={10} className="animate-spin" /> Generating…</> : <><Sparkles size={10} /> {notes ? 'Regenerate' : 'Generate Notes'}</>}
                </button>
              </div>
            </div>

            {generatingNotes && (
              <div className="flex items-center gap-2 py-4 text-slate-400 text-xs">
                <Loader2 size={14} className="animate-spin text-blue-500" />
                AI is writing notes for this module…
              </div>
            )}

            {!generatingNotes && notes && (
              <div className="bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700 rounded-xl p-4 max-h-64 overflow-y-auto">
                {renderNotes(notes)}
              </div>
            )}

            {!generatingNotes && !notes && (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Click "Generate Notes" to create AI-powered study notes for this module.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudyPlanner({ setActiveView }) {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [duration, setDuration] = useState('1 month');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [activePlanId, setActivePlanId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try {
      const data = await api.planner.getPlans();
      setPlans(data);
      if (data.length > 0 && !activePlanId) setActivePlanId(data[0]._id);
    } catch (err) {
      console.error('Load plans error:', err.message);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim() || generating) return;
    setGenerating(true);
    setGenerateError('');
    try {
      const newPlan = await api.planner.generatePlan(topic.trim(), difficulty, duration);
      setPlans(prev => [newPlan, ...prev]);
      setActivePlanId(newPlan._id);
      setShowForm(false);
      setTopic('');
    } catch (err) {
      setGenerateError(err.message || 'Failed to generate plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleModuleStatusChange = async (planId, moduleId, status) => {
    try {
      const updatedPlan = await api.planner.updateModule(planId, moduleId, status);
      setPlans(prev => prev.map(p => p._id === planId ? updatedPlan : p));
    } catch (err) {
      console.error('Update module error:', err.message);
    }
  };

  const handleNotesSaved = async (planId, moduleId, notes) => {
    try {
      const updatedPlan = await api.planner.saveNotes(planId, moduleId, notes);
      setPlans(prev => prev.map(p => p._id === planId ? updatedPlan : p));
    } catch (err) {
      console.error('Save notes error:', err.message);
    }
  };

  const handleDeletePlan = async (planId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this study plan?')) return;
    try {
      await api.planner.deletePlan(planId);
      const remaining = plans.filter(p => p._id !== planId);
      setPlans(remaining);
      if (activePlanId === planId) setActivePlanId(remaining.length > 0 ? remaining[0]._id : null);
    } catch (err) {
      console.error('Delete plan error:', err.message);
    }
  };

  const activePlan = plans.find(p => p._id === activePlanId) || null;
  const progress = activePlan
    ? Math.round((activePlan.completedModules / Math.max(activePlan.totalModules, 1)) * 100)
    : 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-6 pb-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Study Planner</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Generate personalised roadmaps and track your progress</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-sm shadow-blue-200/50 dark:shadow-blue-900/30 flex-shrink-0">
            <Plus size={16} /> New Plan
          </button>
        </div>

        {/* ── Plans list — always visible ──────────────────────────────────── */}
        {!plansLoading && plans.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                My Plans ({plans.length})
              </p>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-zinc-800">
              {plans.map(p => {
                const pct = Math.round((p.completedModules / Math.max(p.totalModules, 1)) * 100);
                const isActive = p._id === activePlanId;
                return (
                  <div key={p._id}
                    onClick={() => setActivePlanId(p._id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group/plan ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-blue-500' : 'bg-slate-300 dark:bg-zinc-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {p.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1 bg-slate-100 dark:bg-zinc-700 rounded-full overflow-hidden max-w-24">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{pct}% · {p.difficulty}</span>
                      </div>
                    </div>
                    <button
                      onClick={e => handleDeletePlan(p._id, e)}
                      className="opacity-0 group-hover/plan:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
                      title="Delete plan">
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Generate form ─────────────────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <Sparkles size={13} className="text-white" />
              </div>
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Generate a New Study Plan</h2>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">What do you want to learn?</label>
                <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  placeholder="e.g. Machine Learning, Web Dev, Physics, Calculus…"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-400 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Difficulty Level</label>
                  <div className="flex gap-2">
                    {DIFFICULTY.map(opt => (
                      <button key={opt} onClick={() => setDifficulty(opt)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-150 ${difficulty === opt ? 'bg-blue-600 text-white shadow-sm shadow-blue-200/40 dark:shadow-blue-900/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-700'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Target Duration</label>
                  <select value={duration} onChange={e => setDuration(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all cursor-pointer">
                    {DURATION.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                <Zap size={15} className="text-amber-500 flex-shrink-0" />
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">AI-powered plan generation</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">— may take 5–10 seconds</span>
                </div>
              </div>

              {generateError && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">{generateError}</p>
                </div>
              )}
            </div>

            <button onClick={handleGenerate} disabled={generating || !topic.trim()}
              className={`w-full py-3 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${generating || !topic.trim() ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-sm shadow-blue-200/50 dark:shadow-blue-900/30 active:scale-[0.99]'}`}>
              {generating ? <><Loader2 size={16} className="animate-spin" /> AI is generating your plan…</> : <><Sparkles size={16} /> Generate Study Plan with AI</>}
            </button>
          </div>
        )}

        {/* Loading */}
        {plansLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : !activePlan ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/30">
              <BookOpen size={24} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">No Study Plans Yet</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
              Generate your first AI-powered study plan to get started on your learning journey.
            </p>
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200/50 dark:shadow-blue-900/30">
              <Sparkles size={16} /> Generate Your First Plan
            </button>
          </div>
        ) : (
          <>
            {/* Plan banner */}
            <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-5 md:p-6 text-white overflow-hidden">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-blue-600/20 blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain size={14} className="text-blue-300" />
                      <span className="text-blue-300 text-[11px] font-semibold uppercase tracking-wide">Active Plan</span>
                    </div>
                    <h2 className="text-lg font-bold truncate">{activePlan.title}</h2>
                    <p className="text-blue-200 text-xs mt-0.5">{activePlan.difficulty} · {activePlan.totalDuration}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-center flex-shrink-0">
                      <div className="text-2xl font-extrabold">{progress}%</div>
                      <div className="text-blue-200 text-[11px] mt-0.5">Complete</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1.5"><BookOpen size={13} className="text-blue-200" /><span>{activePlan.totalModules} Modules</span></div>
                  <div className="flex items-center gap-1.5"><Clock size={13} className="text-blue-200" /><span>{activePlan.totalDuration}</span></div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-green-300" /><span>{activePlan.completedModules} Completed</span></div>
                  <div className="flex items-center gap-1.5"><Target size={13} className="text-amber-300" /><span>{activePlan.totalModules - activePlan.completedModules} Remaining</span></div>
                </div>

                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Modules Left', value: `${activePlan.totalModules - activePlan.completedModules}`, icon: Calendar, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { label: 'Resources', value: `${activePlan.modules.reduce((s, m) => s + (m.resources || 0), 0)} items`, icon: FileText, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                { label: 'Progress', value: `${progress}%`, icon: BarChart2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.bg} mb-3`}>
                    <s.icon size={15} className={s.color} />
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Modules */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Study Modules</h3>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">{activePlan.completedModules} / {activePlan.totalModules} completed</span>
              </div>
              <div className="space-y-3">
                {activePlan.modules.map((module, index) => (
                  <ModuleCard
                    key={module._id}
                    module={module}
                    index={index}
                    planId={activePlan._id}
                    onStatusChange={handleModuleStatusChange}
                    onNotesSaved={handleNotesSaved}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button onClick={() => setActiveView('chat')}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Get AI help with this plan <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
