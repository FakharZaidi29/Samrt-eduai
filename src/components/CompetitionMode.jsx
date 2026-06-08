import { useState } from 'react';
import { Trophy, Brain, Send, Loader2, CheckCircle2, XCircle, Star, ArrowRight, RotateCcw, Zap, BarChart3 } from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import Leaderboard from './Leaderboard.jsx';

const SUBJECTS = [
  { id: 'math', label: 'Mathematics', emoji: '📐' },
  { id: 'physics', label: 'Physics', emoji: '⚡' },
  { id: 'chemistry', label: 'Chemistry', emoji: '🧪' },
  { id: 'biology', label: 'Biology', emoji: '🧬' },
  { id: 'cs', label: 'Computer Science', emoji: '💻' },
  { id: 'english', label: 'English', emoji: '📝' },
  { id: 'history', label: 'History / Pak Studies', emoji: '🏛️' },
  { id: 'islamiat', label: 'Islamiat', emoji: '☪️' },
];

const LEVELS = [
  { id: 'primary', label: 'Class 1-5' },
  { id: 'middle', label: 'Class 6-8' },
  { id: 'matric', label: 'Matric (9-10)' },
  { id: 'fsc', label: 'FSc / FA (11-12)' },
  { id: 'university', label: 'University' },
];

export default function CompetitionMode() {
  const { t } = useLanguage();
  const [phase, setPhase] = useState('setup'); // setup | quiz | result | leaderboard
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('matric');
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  const startQuiz = async () => {
    if (!subject || loading) return;
    setLoading(true);
    try {
      const session = await api.chat.createSession(`Quiz: ${subject}`);
      setSessionId(session._id);
      const subLabel = SUBJECTS.find(s => s.id === subject)?.label || subject;
      const lvlLabel = LEVELS.find(l => l.id === level)?.label || level;
      const prompt = `You are a quiz master. Generate exactly 5 quiz questions for ${subLabel} at ${lvlLabel} level (Pakistani curriculum).

Format EXACTLY like this (no extra text):
Q1: [question]
Q2: [question]
Q3: [question]
Q4: [question]
Q5: [question]

Make questions challenging but fair for the level. Mix theory and application.`;
      const data = await api.chat.sendMessage(session._id, prompt);
      const text = data.message.content;
      const qs = text.split('\n')
        .filter(l => /^Q\d+:/.test(l.trim()))
        .map(l => l.replace(/^Q\d+:\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 5);
      if (qs.length === 0) {
        const fallback = text.split('\n').filter(l => l.trim().length > 20).slice(0, 5);
        setQuestions(fallback);
      } else {
        setQuestions(qs);
      }
      setPhase('quiz');
      setCurrent(0);
      setResults([]);
      setScore(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || loading || !sessionId) return;
    setLoading(true);
    try {
      const q = questions[current];
      const prompt = `Question: "${q}"
Student's Answer: "${answer}"

Evaluate this answer strictly. Respond in EXACTLY this format:
MARKS: [0-10]/10
VERDICT: [Correct / Partially Correct / Incorrect]
CORRECT ANSWER: [give the full correct answer]
EXPLANATION: [explain why in 2-3 sentences, mention what student got right/wrong]`;
      const data = await api.chat.sendMessage(sessionId, prompt);
      const text = data.message.content;
      const marksMatch = text.match(/MARKS:\s*(\d+)/i);
      const verdictMatch = text.match(/VERDICT:\s*(.+)/i);
      const correctMatch = text.match(/CORRECT ANSWER:\s*([\s\S]+?)(?=EXPLANATION:|$)/i);
      const explainMatch = text.match(/EXPLANATION:\s*([\s\S]+)/i);
      const marks = marksMatch ? parseInt(marksMatch[1]) : 5;
      const result = {
        question: q,
        answer,
        marks,
        verdict: verdictMatch?.[1]?.trim() || 'Evaluated',
        correct: correctMatch?.[1]?.trim() || '',
        explanation: explainMatch?.[1]?.trim() || text,
      };
      const newResults = [...results, result];
      const newScore = score + marks;
      setResults(newResults);
      setScore(newScore);
      setAnswer('');
      if (current + 1 >= questions.length) {
        setPhase('result');
        // Save to leaderboard
        const total = questions.length * 10;
        const pctFinal = Math.round((newScore / total) * 100);
        const gradeFinal = pctFinal >= 90 ? 'A+' : pctFinal >= 80 ? 'A' : pctFinal >= 70 ? 'B' : pctFinal >= 60 ? 'C' : 'D';
        const subLabel = SUBJECTS.find(s => s.id === subject)?.label || subject;
        const lvlLabel = LEVELS.find(l => l.id === level)?.label || level;
        api.quiz.saveResult({ subject: subLabel, level: lvlLabel, score: newScore, totalMarks: total, percentage: pctFinal, grade: gradeFinal }).catch((err) => console.error('Save result failed:', err.message));
      } else {
        setCurrent(c => c + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhase('setup');
    setSubject('');
    setQuestions([]);
    setCurrent(0);
    setResults([]);
    setScore(0);
    setSessionId(null);
    setAnswer('');
  };

  const totalMarks = questions.length * 10;
  const pct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  const getGrade = () => {
    if (pct >= 90) return { grade: 'A+', color: 'text-emerald-400', msg: 'Outstanding! 🏆' };
    if (pct >= 80) return { grade: 'A', color: 'text-emerald-400', msg: 'Excellent! 🌟' };
    if (pct >= 70) return { grade: 'B', color: 'text-blue-400', msg: 'Good Job! 👍' };
    if (pct >= 60) return { grade: 'C', color: 'text-yellow-400', msg: 'Keep Practicing! 📚' };
    return { grade: 'D', color: 'text-red-400', msg: 'Need More Study! 💪' };
  };

  if (phase === 'setup') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6 max-w-2xl mx-auto space-y-6 pb-10 animate-fadeIn">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
              <Trophy size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('challengeModeTitle')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('quizSetup')}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t('selectLevel')}</p>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map(l => (
                  <button key={l.id} onClick={() => setLevel(l.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${level === l.id ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-700'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t('selectSubject')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SUBJECTS.map(s => (
                  <button key={s.id} onClick={() => setSubject(s.id)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 border ${subject === s.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'}`}>
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-xs text-center leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={startQuiz} disabled={!subject || loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> {t('generatingQuiz')}</> : <><Zap size={18} /> {t('startQuiz')}</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    const q = questions[current];
    const prev = results[current - 1];
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6 max-w-2xl mx-auto space-y-5 pb-10">
          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('question')} {current + 1} {t('of2')} {questions.length}</span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Score: {score}/{current * 10}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${((current) / questions.length) * 100}%` }} />
          </div>

          {/* Previous result */}
          {prev && (
            <div className={`p-4 rounded-2xl border animate-fadeIn ${prev.marks >= 7 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900' : prev.marks >= 4 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900'}`}>
              <div className="flex items-center gap-2 mb-1">
                {prev.marks >= 7 ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
                <span className="text-sm font-bold">{prev.verdict} — {prev.marks}/10 marks</span>
              </div>
              {prev.correct && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1"><strong>{t('correct')}:</strong> {prev.correct}</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{prev.explanation}</p>
            </div>
          )}

          {/* Current question */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl p-6 animate-fadeIn">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold">{current + 1}</div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{t('question')}</span>
            </div>
            <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">{q}</p>
          </div>

          <div className="space-y-3">
            <textarea value={answer} onChange={e => setAnswer(e.target.value)}
              placeholder={t('yourAnswer')}
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-400 resize-none transition-all" />
            <button onClick={submitAnswer} disabled={!answer.trim() || loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-blue-900/30">
              {loading ? <><Loader2 size={16} className="animate-spin" /> {t('generatingQuiz')}</> : <><Send size={16} /> {t('submitAnswer')}</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Leaderboard screen
  if (phase === 'leaderboard') {
    return <Leaderboard onBack={() => setPhase('result')} onNewQuiz={reset} />;
  }

  const g = getGrade();
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-5 pb-10 animate-fadeIn">
        <div className="text-center bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-8 text-white">
          <div className="text-6xl font-extrabold mb-2 animate-countUp">{pct}%</div>
          <div className={`text-3xl font-bold ${g.color} mb-1`}>{g.grade}</div>
          <div className="text-slate-300 text-lg mb-2">{g.msg}</div>
          <div className="text-slate-400 text-sm">{score} / {totalMarks} marks</div>
        </div>

        <div className="space-y-4">
          {results.map((r, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${r.marks >= 7 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900' : r.marks >= 4 ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900'}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{i + 1}. {r.question}</p>
                <span className={`text-sm font-bold flex-shrink-0 flex items-center gap-1 ${r.marks >= 7 ? 'text-emerald-600' : r.marks >= 4 ? 'text-yellow-600' : 'text-red-600'}`}>
                  <Star size={12} fill="currentColor" /> {r.marks}/10
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1"><strong>{t('yourAnswerLabel')}:</strong> {r.answer}</p>
              {r.correct && <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1"><strong>{t('correct')}:</strong> {r.correct}</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400">{r.explanation}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={reset}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
            <RotateCcw size={16} /> {t('tryAgain')}
          </button>
          <button onClick={() => setPhase('leaderboard')}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
            <BarChart3 size={16} /> {t('viewLeaderboard')}
          </button>
        </div>
      </div>
    </div>
  );
}
