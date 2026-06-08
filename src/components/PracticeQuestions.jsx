import { useState } from 'react';
import { PenTool, Send, Loader2, CheckCircle2, Star, RotateCcw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const SUBJECTS = [
  { id: 'math', label: 'Mathematics', emoji: '📐' },
  { id: 'physics', label: 'Physics', emoji: '⚡' },
  { id: 'chemistry', label: 'Chemistry', emoji: '🧪' },
  { id: 'biology', label: 'Biology', emoji: '🧬' },
  { id: 'cs', label: 'Computer Science', emoji: '💻' },
  { id: 'english', label: 'English', emoji: '📝' },
  { id: 'history', label: 'History / Pak Studies', emoji: '🏛️' },
  { id: 'islamiat', label: 'Islamiat', emoji: '☪️' },
  { id: 'urdu', label: 'Urdu', emoji: '🔤' },
  { id: 'general', label: 'General Knowledge', emoji: '🌍' },
];

const LEVELS = [
  { id: 'primary', label: 'Class 1-5' },
  { id: 'middle', label: 'Class 6-8' },
  { id: 'matric', label: 'Matric (9-10)' },
  { id: 'fsc', label: 'FSc / FA (11-12)' },
  { id: 'university', label: 'University' },
  { id: 'teacher', label: 'Teacher Level' },
];

function ReviewCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const ratingColor = item.rating >= 4 ? 'text-emerald-600' : item.rating >= 3 ? 'text-yellow-600' : 'text-red-600';
  const bg = item.rating >= 4 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900' : item.rating >= 3 ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900';

  return (
    <div className={`rounded-2xl border p-4 ${bg} animate-fadeIn`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800 dark:text-white">{index + 1}. {item.question}</p>
        <div className={`flex items-center gap-1 flex-shrink-0 font-bold text-sm ${ratingColor}`}>
          <Star size={13} fill="currentColor" />
          {item.rating}/5
        </div>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2"><strong>Your answer:</strong> {item.answer}</p>
      <button onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium hover:underline">
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? 'Hide feedback' : 'See AI feedback'}
      </button>
      {expanded && (
        <div className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
          {item.verdict && <p><strong>Verdict:</strong> {item.verdict}</p>}
          {item.correct && <p><strong>Model Answer:</strong> {item.correct}</p>}
          {item.feedback && <p><strong>Feedback:</strong> {item.feedback}</p>}
        </div>
      )}
    </div>
  );
}

export default function PracticeQuestions() {
  const { t } = useLanguage();
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('matric');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [phase, setPhase] = useState('setup'); // setup | practice | reviewed

  const generate = async () => {
    if (!subject || loading) return;
    setLoading(true);
    try {
      const session = await api.chat.createSession(`Practice: ${subject}`);
      setSessionId(session._id);
      const subLabel = SUBJECTS.find(s => s.id === subject)?.label || subject;
      const lvlLabel = LEVELS.find(l => l.id === level)?.label || level;
      const topicLine = topic.trim() ? ` on the topic "${topic.trim()}"` : '';
      const prompt = `Generate 5 practice questions for ${subLabel}${topicLine} at ${lvlLabel} level (Pakistani curriculum).

Format EXACTLY (no other text):
Q1: [question]
Q2: [question]
Q3: [question]
Q4: [question]
Q5: [question]

Mix short-answer and problem-solving questions.`;
      const data = await api.chat.sendMessage(session._id, prompt);
      const text = data.message.content;
      const qs = text.split('\n')
        .filter(l => /^Q\d+:/.test(l.trim()))
        .map(l => l.replace(/^Q\d+:\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 5);
      setQuestions(qs.length > 0 ? qs : text.split('\n').filter(l => l.trim().length > 20).slice(0, 5));
      setAnswers({});
      setReviews([]);
      setPhase('practice');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAll = async () => {
    const answered = questions.filter((_, i) => answers[i]?.trim());
    if (answered.length === 0 || reviewing || !sessionId) return;
    setReviewing(true);
    const results = [];
    try {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const a = answers[i] || '(no answer)';
        const prompt = `Question: "${q}"
Student Answer: "${a}"

Review this. Respond EXACTLY:
RATING: [1-5]/5
VERDICT: [Excellent / Good / Needs Work / Incorrect]
MODEL ANSWER: [concise correct answer]
FEEDBACK: [2-3 sentences of constructive feedback]`;
        const data = await api.chat.sendMessage(sessionId, prompt);
        const text = data.message.content;
        const ratingMatch = text.match(/RATING:\s*(\d+)/i);
        const verdictMatch = text.match(/VERDICT:\s*(.+)/i);
        const modelMatch = text.match(/MODEL ANSWER:\s*([\s\S]+?)(?=FEEDBACK:|$)/i);
        const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]+)/i);
        results.push({
          question: q,
          answer: a,
          rating: ratingMatch ? parseInt(ratingMatch[1]) : 3,
          verdict: verdictMatch?.[1]?.trim() || '',
          correct: modelMatch?.[1]?.trim() || '',
          feedback: feedbackMatch?.[1]?.trim() || text,
        });
      }
      setReviews(results);
      setPhase('reviewed');
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(false);
    }
  };

  const reset = () => {
    setPhase('setup');
    setSubject('');
    setTopic('');
    setQuestions([]);
    setAnswers({});
    setReviews([]);
    setSessionId(null);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  if (phase === 'setup') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6 max-w-2xl mx-auto space-y-6 pb-10 animate-fadeIn">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
              <PenTool size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('practiceQuestions')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('practiceSetup')}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t('selectLevel')}</p>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map(l => (
                  <button key={l.id} onClick={() => setLevel(l.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${level === l.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t('selectSubject')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {SUBJECTS.map(s => (
                  <button key={s.id} onClick={() => setSubject(s.id)}
                    className={`p-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1 border ${subject === s.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'}`}>
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-center leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Specific Topic <span className="font-normal text-slate-400">(optional)</span></p>
              <input value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Newton's Laws, Quadratic Equations…"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-400 transition-all" />
            </div>

            <button onClick={generate} disabled={!subject || loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
              {loading ? <><Loader2 size={18} className="animate-spin" /> {t('generating')}</> : <><Sparkles size={18} /> {t('generateQuestions')}</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'practice') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6 max-w-2xl mx-auto space-y-5 pb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Answer All Questions</h2>
            <span className="text-xs text-slate-400">{Object.keys(answers).filter(k => answers[k]?.trim()).length}/{questions.length} answered</span>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl p-5 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{i + 1}</div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{q}</p>
              </div>
              <textarea
                value={answers[i] || ''}
                onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                placeholder={t('yourAnswer')}
                rows={3}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-400 resize-none transition-all"
              />
              {answers[i]?.trim() && <CheckCircle2 size={14} className="text-emerald-500" />}
            </div>
          ))}

          <button onClick={submitAll} disabled={reviewing || Object.keys(answers).filter(k => answers[k]?.trim()).length === 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-md">
            {reviewing ? <><Loader2 size={16} className="animate-spin" /> {t('aiIsThinking')}</> : <><Send size={16} /> {t('submitAnswers')}</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-5 pb-10 animate-fadeIn">
        <div className="text-center bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-6 text-white">
          <div className="text-4xl font-extrabold mb-1">{avgRating} / 5</div>
          <div className="text-slate-300">{t('avgRating')}</div>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[1,2,3,4,5].map(n => (
              <Star key={n} size={18} fill={n <= Math.round(avgRating) ? '#fbbf24' : 'transparent'} className={n <= Math.round(avgRating) ? 'text-amber-400' : 'text-slate-600'} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {reviews.map((r, i) => <ReviewCard key={i} item={r} index={i} />)}
        </div>

        <button onClick={reset}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md">
          <RotateCcw size={16} /> {t('newPractice')}
        </button>
      </div>
    </div>
  );
}
