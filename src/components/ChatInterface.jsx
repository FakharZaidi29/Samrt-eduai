import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  Send,
  Paperclip,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Search,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Trash2,
  Loader2,
  MessageCircle,
  Image,
  ExternalLink,
  Play,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { api } from '../services/api.js';

// ─── Media block components ───────────────────────────────────────────────────

function ImageBlock({ url, title }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700">
      {!loaded && !error && (
        <div className="w-full h-48 bg-slate-100 dark:bg-zinc-800 flex flex-col items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin text-blue-500" />
          <span className="text-xs text-slate-400">Generating image…</span>
        </div>
      )}
      {error ? (
        <div className="w-full h-32 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center gap-2 text-slate-400">
          <Image size={18} />
          <span className="text-xs">Image unavailable</span>
        </div>
      ) : (
        <img
          src={url}
          alt={title}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 h-0'}`}
        />
      )}
      {title && (
        <div className="px-3 py-2 bg-slate-50 dark:bg-zinc-800/60 border-t border-slate-100 dark:border-zinc-700">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Image size={10} />
            {title}
          </p>
        </div>
      )}
    </div>
  );
}

function VideoEmbed({ embedUrl, watchUrl, videoTitle, channel }) {
  const [show, setShow] = useState(false);

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700">
      {show ? (
        <iframe
          src={embedUrl}
          title={videoTitle}
          className="w-full"
          height="280"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          onClick={() => setShow(true)}
          className="w-full h-44 bg-gradient-to-br from-zinc-900 to-black flex flex-col items-center justify-center gap-3 hover:from-zinc-800 transition-all duration-200 group"
        >
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play size={22} className="text-white ml-1" fill="white" />
          </div>
          <div className="text-center px-4">
            <p className="text-white text-xs font-semibold line-clamp-2">{videoTitle}</p>
            {channel && <p className="text-zinc-400 text-[11px] mt-1">{channel}</p>}
          </div>
        </button>
      )}
      <div className="px-3 py-2 bg-slate-50 dark:bg-zinc-800/60 border-t border-slate-100 dark:border-zinc-700 flex items-center justify-between">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
          <Play size={10} />
          <span className="truncate">{videoTitle}</span>
        </p>
        {watchUrl && (
          <a href={watchUrl} target="_blank" rel="noopener noreferrer"
            className="text-[11px] text-blue-500 hover:text-blue-600 flex items-center gap-1 flex-shrink-0 ml-2">
            <ExternalLink size={10} /> Open
          </a>
        )}
      </div>
    </div>
  );
}

function VideoLink({ searchUrl, videoTitle }) {
  return (
    <div className="my-3">
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/40 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
      >
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Play size={14} className="text-white ml-0.5" fill="white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 truncate">{videoTitle}</p>
          <p className="text-[11px] text-blue-500 dark:text-blue-400 mt-0.5">Click to search on YouTube →</p>
        </div>
        <ExternalLink size={14} className="text-blue-400 flex-shrink-0" />
      </a>
    </div>
  );
}

// ─── Markdown + Media renderer ───────────────────────────────────────────────

function renderContent(content) {
  const formatInline = (text) =>
    text.split(/(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
        return <strong key={j} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      if (part.startsWith('_') && part.endsWith('_') && part.length > 2)
        return <em key={j} className="italic">{part.slice(1, -1)}</em>;
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2)
        return (
          <code key={j} className="bg-slate-200/70 dark:bg-zinc-700 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded text-[11px] font-mono">
            {part.slice(1, -1)}
          </code>
        );
      return part;
    });

  // Handle triple-backtick code blocks first
  const lines = content.split('\n');
  const result = [];
  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      result.push(
        <div key={`code-${i}`} className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700">
          {lang && (
            <div className="px-4 py-1.5 bg-slate-200 dark:bg-zinc-700 text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang}
            </div>
          )}
          <pre className="bg-slate-100 dark:bg-zinc-800 px-4 py-3 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre">
            {codeLines.join('\n')}
          </pre>
        </div>
      );
      i++; // skip closing ```
      continue;
    }
    result.push({ line: lines[i], idx: i });
    i++;
  }

  return result.map((item) => {
    if (!item || item.line === undefined) return item; // already a React element
    const { line, idx: i } = item;
    const trimmed = line.trim();

    // ── IMAGE marker: [IMAGE||url||title] ──────────────────────────────────
    if (trimmed.startsWith('[IMAGE||')) {
      const inner = trimmed.slice(8, -1);
      const sep = inner.indexOf('||');
      const url = sep !== -1 ? inner.slice(0, sep) : inner;
      const title = sep !== -1 ? inner.slice(sep + 2) : '';
      return <ImageBlock key={i} url={url} title={title} />;
    }

    // ── VIDEO EMBED: [VIDEO_EMBED||embedUrl||watchUrl||videoTitle||channel] ─
    if (trimmed.startsWith('[VIDEO_EMBED||')) {
      const parts = trimmed.slice(14, -1).split('||');
      return (
        <VideoEmbed
          key={i}
          embedUrl={parts[0] || ''}
          watchUrl={parts[1] || ''}
          videoTitle={parts[2] || 'Educational Video'}
          channel={parts[3] || ''}
        />
      );
    }

    // ── VIDEO LINK: [VIDEO_LINK||searchUrl||title] ─────────────────────────
    if (trimmed.startsWith('[VIDEO_LINK||')) {
      const inner = trimmed.slice(13, -1);
      const sep = inner.indexOf('||');
      const url = sep !== -1 ? inner.slice(0, sep) : inner;
      const title = sep !== -1 ? inner.slice(sep + 2) : 'Educational Video';
      return <VideoLink key={i} searchUrl={url} videoTitle={title} />;
    }

    if (!trimmed) return <div key={i} className="h-2" />;

    // ── Headings: ###, ##, # ──────────────────────────────────────────────────
    const h3 = trimmed.match(/^###\s+(.+)/);
    if (h3) return (
      <p key={i} className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-0.5">
        {formatInline(h3[1])}
      </p>
    );

    const h2 = trimmed.match(/^##\s+(.+)/);
    if (h2) return (
      <p key={i} className="text-[15px] font-bold text-slate-900 dark:text-white mt-4 mb-0.5 border-b border-slate-100 dark:border-zinc-800 pb-1">
        {formatInline(h2[1])}
      </p>
    );

    const h1 = trimmed.match(/^#\s+(.+)/);
    if (h1) return (
      <p key={i} className="text-base font-extrabold text-slate-900 dark:text-white mt-4 mb-1">
        {formatInline(h1[1])}
      </p>
    );

    // ── Horizontal rule ───────────────────────────────────────────────────────
    if (trimmed === '---' || trimmed === '***') {
      return <hr key={i} className="border-slate-200 dark:border-zinc-700 my-2" />;
    }

    // ── Code block (single-line backtick) ─────────────────────────────────────
    if (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 2) {
      return (
        <div key={i} className="my-2">
          <code className="block bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-300 px-4 py-2.5 rounded-xl text-xs font-mono border border-slate-200 dark:border-zinc-700">
            {trimmed.slice(1, -1)}
          </code>
        </div>
      );
    }

    // ── Bullet ────────────────────────────────────────────────────────────────
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <div key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="text-blue-400 flex-shrink-0 mt-0.5 select-none">•</span>
          <span>{formatInline(trimmed.slice(2))}</span>
        </div>
      );
    }

    // ── Numbered list ─────────────────────────────────────────────────────────
    const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      return (
        <div key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="text-blue-500 font-semibold flex-shrink-0 w-5">{numMatch[1]}.</span>
          <span>{formatInline(numMatch[2])}</span>
        </div>
      );
    }

    // ── Blockquote ────────────────────────────────────────────────────────────
    if (trimmed.startsWith('> ')) {
      return (
        <div key={i} className="border-l-4 border-blue-400 pl-3 my-1">
          <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
            {formatInline(trimmed.slice(2))}
          </p>
        </div>
      );
    }

    return (
      <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {formatInline(trimmed)}
      </p>
    );
  });
}

// ─── Message bubbles ──────────────────────────────────────────────────────────

function AIMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : message.time || '';

  return (
    <div className="flex items-start gap-3 group animate-[fadeIn_0.2s_ease-out]">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200/50 dark:shadow-blue-900/30">
        <Sparkles size={14} className="text-white" />
      </div>

      <div className="flex-1 min-w-0 max-w-2xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">EduAI Tutor</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{time}</span>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 rounded-2xl rounded-tl-none px-4 py-3.5 space-y-1">
          {renderContent(message.content)}
        </div>

        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={() => setLiked(true)}
            className={`p-1.5 rounded-lg transition-colors ${liked === true ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
          >
            <ThumbsUp size={11} />
          </button>
          <button
            onClick={() => setLiked(false)}
            className={`p-1.5 rounded-lg transition-colors ${liked === false ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
          >
            <ThumbsDown size={11} />
          </button>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
            <RefreshCw size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ message, initials }) {
  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : message.time || '';

  return (
    <div className="flex items-start gap-3 flex-row-reverse animate-[fadeIn_0.2s_ease-out]">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 dark:from-zinc-600 dark:to-zinc-700 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm">
        {initials}
      </div>
      <div className="flex-1 min-w-0 flex flex-col items-end max-w-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{time}</span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">You</span>
        </div>
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-sm shadow-blue-200/40 dark:shadow-blue-900/30">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center flex-shrink-0">
        <Sparkles size={14} className="text-white" />
      </div>
      <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 rounded-2xl rounded-tl-none px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onNewChat }) {
  const { t } = useLanguage();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center mb-4 shadow-lg shadow-blue-900/30">
        <MessageCircle size={28} className="text-white" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('startConversation')}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6 leading-relaxed">
        {t('chatPlaceholderSub')}
      </p>
      <button
        onClick={onNewChat}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200/50 dark:shadow-blue-900/30"
      >
        <Plus size={16} />
        {t('newChat')}
      </button>
    </div>
  );
}

const SUGGESTIONS = [
  'Give me a practice problem',
  'Explain with a visual analogy',
  'Quiz me on this topic',
  'Summarise key points',
];

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatInterface({ initialTopic, onTopicConsumed }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const initials = getInitials(user?.name);

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);
  const pendingTopicRef = useRef(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [input]);

  const loadSessions = async () => {
    try {
      const data = await api.chat.getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Load sessions error:', err.message);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Auto-start lesson topic from Dashboard
  useEffect(() => {
    if (!initialTopic) return;
    pendingTopicRef.current = initialTopic;
    if (onTopicConsumed) onTopicConsumed();
    (async () => {
      try {
        const session = await api.chat.createSession(initialTopic);
        const newSession = { _id: session._id, title: initialTopic, updatedAt: session.updatedAt, preview: '', messageCount: 0 };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(session._id);
        setMessages([]);
        setSessionTitle(initialTopic);
        // send auto message after a tick so state is ready
        setTimeout(async () => {
          const topic = pendingTopicRef.current;
          pendingTopicRef.current = null;
          if (!topic) return;
          const prompt = `Please teach me about: ${topic}\n\nGive me a comprehensive lesson with:\n1. Clear explanation with key concepts\n2. Examples and applications\n3. Diagrams or visual aids where helpful\n4. Practice questions at the end`;
          setIsTyping(true);
          setMessages([{ role: 'user', content: prompt }]);
          try {
            const data = await api.chat.sendMessage(session._id, prompt);
            setMessages([
              { role: 'user', content: prompt },
              { role: 'assistant', content: data.message.content },
            ]);
            setSessions(prev => prev.map(s => s._id === session._id ? { ...s, title: topic, preview: data.message.content.slice(0, 80) } : s));
          } catch (err) {
            console.error('Auto lesson send error:', err.message);
          } finally {
            setIsTyping(false);
          }
        }, 100);
      } catch (err) {
        console.error('Auto lesson session error:', err.message);
      }
    })();
  }, [initialTopic]);

  const loadMessages = useCallback(async (sessionId) => {
    setMessagesLoading(true);
    setMessages([]);
    try {
      const data = await api.chat.getMessages(sessionId);
      setMessages(data.messages || []);
      setSessionTitle(data.title || 'Chat');
    } catch (err) {
      console.error('Load messages error:', err.message);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const handleSelectSession = (sessionId) => {
    if (sessionId === activeSessionId) { setMobileSessionsOpen(false); return; }
    setActiveSessionId(sessionId);
    loadMessages(sessionId);
    setMobileSessionsOpen(false);
  };

  const handleNewChat = async () => {
    setMobileSessionsOpen(false);
    try {
      const session = await api.chat.createSession('New Chat');
      setSessions((prev) => [
        { _id: session._id, title: 'New Chat', updatedAt: session.updatedAt, preview: '', messageCount: 0 },
        ...prev,
      ]);
      setActiveSessionId(session._id);
      setMessages([]);
      setSessionTitle('New Chat');
    } catch (err) {
      console.error('New chat error:', err.message);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await api.chat.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
        setSessionTitle('');
      }
    } catch (err) {
      console.error('Delete session error:', err.message);
    }
  };

  const handleSend = async (text) => {
    const content = (text || input).trim();
    if (!content || isTyping || !activeSessionId) return;

    const tempUserMsg = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await api.chat.sendMessage(activeSessionId, content);
      const aiMsg = data.message;

      setMessages((prev) => [...prev, aiMsg]);

      // Update session title if it changed
      if (data.sessionTitle && data.sessionTitle !== 'New Chat') {
        setSessionTitle(data.sessionTitle);
        setSessions((prev) =>
          prev.map((s) =>
            s._id === activeSessionId
              ? { ...s, title: data.sessionTitle, preview: content.slice(0, 80), updatedAt: new Date().toISOString() }
              : s
          )
        );
      }
    } catch (err) {
      console.error('Send message error:', err.message);
      const errorMsg = {
        _id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSession = sessions.find((s) => s._id === activeSessionId);

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Mobile sessions drawer overlay ──────────────────────────────── */}
      {mobileSessionsOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileSessionsOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl max-h-[75vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t('chats')}</h3>
              <button onClick={handleNewChat} className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-xl">
                <Plus size={13} /> {t('newChat')}
              </button>
            </div>
            <div className="px-3 py-2 border-b border-slate-50 dark:border-zinc-800">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                <Search size={13} className="text-slate-400 flex-shrink-0" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search…" className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {sessionsLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-blue-500" /></div>
              ) : filteredSessions.length === 0 ? (
                <p className="text-xs text-slate-400 px-3 py-4 text-center">{searchQuery ? 'No results' : t('noSessions')}</p>
              ) : filteredSessions.map(session => {
                const isActive = activeSessionId === session._id;
                return (
                  <button key={session._id} onClick={() => handleSelectSession(session._id)}
                    className={`w-full text-left px-3 py-3 rounded-xl mb-0.5 transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40' : 'hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{session.title}</p>
                    {session.preview && <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{session.preview}</p>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Left: Chat history panel ─────────────────────────────────────── */}
      <div className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
        {/* New chat button */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-sm shadow-blue-200/50 dark:shadow-blue-900/30"
          >
            <Plus size={16} />
            {t('newChat')}
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 focus-within:border-blue-300 dark:focus-within:border-blue-700 transition-colors">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 px-2 pb-2 uppercase tracking-widest">
            Recent
          </p>

          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} className="animate-spin text-blue-500" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 px-2 py-4 text-center">
              {searchQuery ? 'No results found' : t('noSessions')}
            </p>
          ) : (
            filteredSessions.map((session) => {
              const isActive = activeSessionId === session._id;
              return (
                <div key={session._id} className="relative group/item mb-0.5">
                  <button
                    onClick={() => handleSelectSession(session._id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 pr-8 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare
                        size={13}
                        className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-medium truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                            {session.title}
                          </p>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {timeAgo(session.updatedAt)}
                          </span>
                        </div>
                        {session.preview && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {session.preview}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteSession(session._id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-300 dark:text-zinc-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-0 group-hover/item:opacity-100 transition-all duration-150"
                    title="Delete chat"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: Chat area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-black min-w-0">

        {/* Mobile-only top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 md:hidden flex-shrink-0">
          <button onClick={() => setMobileSessionsOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl">
            <MessageSquare size={13} />
            {t('chats')} ({sessions.length})
          </button>
          <button onClick={handleNewChat}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-xl transition-colors">
            <Plus size={13} /> {t('newChat')}
          </button>
        </div>

        {!activeSessionId ? (
          <EmptyState onNewChat={handleNewChat} />
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center shadow-sm shadow-blue-200/40 dark:shadow-blue-900/30">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white text-sm">EduAI Tutor</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-48">
                      Online · {sessionTitle || activeSession?.title || 'New Chat'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => activeSessionId && handleDeleteSession(activeSessionId, e)}
                  className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Delete this chat"
                >
                  <Trash2 size={15} />
                </button>
                <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                  <MoreHorizontal size={17} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-blue-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <Sparkles size={28} className="text-blue-400 mb-3" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ready to help!</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg) =>
                  msg.role === 'assistant'
                    ? <AIMessage key={msg._id} message={msg} />
                    : <UserMessage key={msg._id} message={msg} initials={initials} />
                )
              )}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion chips */}
            {!isTyping && messages.length === 0 && (
              <div className="flex gap-2 flex-wrap px-5 pb-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-zinc-900 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div className="px-5 pb-5 flex-shrink-0">
              <div className="flex items-end gap-3">
                <div className="flex-1 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 focus-within:border-blue-300 dark:focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100/60 dark:focus-within:ring-blue-900/40 transition-all duration-200">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('typeMessage')}
                    rows={1}
                    className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-zinc-700/60">
                    <div className="flex items-center gap-0.5">
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Attach file">
                        <Paperclip size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Voice input">
                        <Mic size={15} />
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 select-none">
                      Shift + Enter for newline
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className={`p-3.5 rounded-2xl transition-all duration-200 flex-shrink-0 ${
                    input.trim() && !isTyping
                      ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm shadow-blue-200/50 dark:shadow-blue-900/30'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isTyping ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-2.5">
                EduAI may produce inaccuracies — always verify important information.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
