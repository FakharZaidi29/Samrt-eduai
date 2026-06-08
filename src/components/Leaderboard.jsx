import { useState, useEffect } from 'react';
import { Trophy, RotateCcw, ArrowLeft, Loader2, Star, Medal } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const SUBJECTS_FILTER = [
  { id: 'all', label: 'All Subjects' },
  { id: 'Mathematics', label: 'Mathematics' },
  { id: 'Physics', label: 'Physics' },
  { id: 'Chemistry', label: 'Chemistry' },
  { id: 'Biology', label: 'Biology' },
  { id: 'Computer Science', label: 'Computer Science' },
  { id: 'English', label: 'English' },
];

const RANK_STYLE = {
  1: { bg: 'bg-amber-400', text: 'text-white', icon: '🥇' },
  2: { bg: 'bg-slate-400', text: 'text-white', icon: '🥈' },
  3: { bg: 'bg-orange-400', text: 'text-white', icon: '🥉' },
};

const GRADE_COLOR = {
  'A+': 'text-emerald-600 dark:text-emerald-400',
  'A':  'text-emerald-600 dark:text-emerald-400',
  'B':  'text-blue-600 dark:text-blue-400',
  'C':  'text-yellow-600 dark:text-yellow-400',
  'D':  'text-red-500',
};

export default function Leaderboard({ onBack, onNewQuiz }) {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState('global'); // global | mine

  useEffect(() => {
    load();
  }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const [global, mine] = await Promise.all([
        api.quiz.getLeaderboard(filter === 'all' ? '' : filter),
        api.quiz.getMyResults(),
      ]);
      setResults(global);
      setMyResults(mine);
    } catch (err) {
      console.error('Leaderboard error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const list = tab === 'global' ? results : myResults.map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-5 pb-10 animate-fadeIn">

        {/* Header */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" /> Leaderboard
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Top quiz scores</p>
          </div>
          {onNewQuiz && (
            <button onClick={onNewQuiz} className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              <RotateCcw size={13} /> New Quiz
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[{ id: 'global', label: '🌍 Global' }, { id: 'mine', label: '👤 My Scores' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Subject filter (global only) */}
        {tab === 'global' && (
          <div className="flex flex-wrap gap-2">
            {SUBJECTS_FILTER.map(s => (
              <button key={s.id} onClick={() => setFilter(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200'}`}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-blue-500" /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <Trophy size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">No results yet. Take a quiz to appear here!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Top 3 podium */}
            {tab === 'global' && list.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[list[1], list[0], list[2]].map((r, idx) => {
                  if (!r) return <div key={idx} />;
                  const realRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                  const style = RANK_STYLE[realRank];
                  return (
                    <div key={r._id} className={`flex flex-col items-center p-3 rounded-2xl ${realRank === 1 ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700' : 'bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700'}`}>
                      <span className="text-2xl mb-1">{style.icon}</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white text-center truncate w-full">{r.userName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-full text-center">{r.subject}</p>
                      <p className={`text-lg font-extrabold mt-1 ${GRADE_COLOR[r.grade] || 'text-slate-700'}`}>{r.percentage}%</p>
                      <p className="text-[10px] text-slate-400">{r.grade}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            {list.map((r, i) => {
              const isMe = r.userId === user?._id;
              const rankStyle = RANK_STYLE[r.rank];
              return (
                <div key={r._id || i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isMe ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${rankStyle ? `${rankStyle.bg} ${rankStyle.text}` : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400'}`}>
                    {rankStyle ? rankStyle.icon : `#${r.rank}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{r.userName}</p>
                      {isMe && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">You</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{r.subject} · {r.level}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-base font-extrabold ${GRADE_COLOR[r.grade] || 'text-slate-700'}`}>{r.percentage}%</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{r.score}/{r.totalMarks} · {r.grade}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
