import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import ChatSession from '../models/ChatSession.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ─── Provider selection ───────────────────────────────────────────────────────

function getProvider() {
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_')) return 'groq';
  if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('your_')) return 'anthropic';
  return 'mock';
}

// ─── Tools ────────────────────────────────────────────────────────────────────

const ANTHROPIC_TOOLS = [
  {
    name: 'generate_image',
    description: 'Generate an educational image, diagram, chart, or illustration. Use whenever a visual would help — math diagrams, science illustrations, process flows, concept maps.',
    input_schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Detailed image description. Example: "A labeled diagram of DNA double helix showing base pairs, sugar-phosphate backbone, educational illustration, clean white background"' },
        title: { type: 'string', description: 'Short label, e.g. "DNA Double Helix"' },
      },
      required: ['prompt', 'title'],
    },
  },
  {
    name: 'find_video',
    description: 'Find a relevant educational YouTube video. Use when user asks for a video or when watching would help learning.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'YouTube search query, e.g. "3Blue1Brown neural networks explained"' },
        title: { type: 'string', description: 'Short description of video content' },
      },
      required: ['query', 'title'],
    },
  },
];

const GROQ_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'generate_image',
      description: 'Generate an educational image, diagram, chart, or illustration. Use whenever a visual would help — math diagrams, science illustrations, process flows, concept maps.',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Detailed image description for generation' },
          title: { type: 'string', description: 'Short label for this image' },
        },
        required: ['prompt', 'title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_video',
      description: 'Find a relevant educational YouTube video. Use when user asks for a video.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'YouTube search query optimized for educational content' },
          title: { type: 'string', description: 'Short description of what this video covers' },
        },
        required: ['query', 'title'],
      },
    },
  },
];

// ─── Media helpers ────────────────────────────────────────────────────────────

function buildImageUrl(prompt) {
  const enhanced = `${prompt}, educational illustration, clean, professional, high detail, labeled, clear background`;
  const seed = Math.floor(Math.random() * 999999);
  // Use our own proxy endpoint so the browser loads from localhost (no CORS/CSP issues)
  return `/api/media/image?prompt=${encodeURIComponent(enhanced)}&seed=${seed}`;
}

async function findVideo(query, title) {
  if (process.env.YOUTUBE_API_KEY && !process.env.YOUTUBE_API_KEY.includes('your_')) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.items?.length > 0) {
        const item = data.items[0];
        return {
          embedUrl: `https://www.youtube.com/embed/${item.id.videoId}?rel=0`,
          watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          videoTitle: item.snippet.title,
          channel: item.snippet.channelTitle,
        };
      }
    } catch (err) {
      console.error('YouTube API error:', err.message);
    }
  }
  return {
    searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    videoTitle: title,
  };
}

async function processToolCall(name, args) {
  if (name === 'generate_image') {
    const imageUrl = buildImageUrl(args.prompt);
    return { type: 'image', url: imageUrl, title: args.title, result: { generated: true, url: imageUrl } };
  }
  if (name === 'find_video') {
    const video = await findVideo(args.query, args.title);
    return { type: 'video', title: args.title, ...video, result: video };
  }
  return null;
}

function appendMediaToContent(text, mediaBlocks) {
  let out = text;
  for (const m of mediaBlocks) {
    if (m.type === 'image') {
      out += `\n[IMAGE||${m.url}||${m.title}]`;
    } else if (m.type === 'video') {
      if (m.embedUrl) {
        out += `\n[VIDEO_EMBED||${m.embedUrl}||${m.watchUrl}||${m.videoTitle}||${m.channel || ''}]`;
      } else {
        out += `\n[VIDEO_LINK||${m.searchUrl}||${m.videoTitle}]`;
      }
    }
  }
  return out;
}

// ─── Anthropic chat ───────────────────────────────────────────────────────────

async function chatWithAnthropic(messages, systemPrompt, model) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const mediaBlocks = [];

  const first = await client.messages.create({
    model: model || 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    tools: ANTHROPIC_TOOLS,
    messages,
  });

  let text = first.content.filter(b => b.type === 'text').map(b => b.text).join('');

  if (first.stop_reason === 'tool_use') {
    const toolResults = [];
    for (const block of first.content) {
      if (block.type !== 'tool_use') continue;
      const media = await processToolCall(block.name, block.input);
      if (media) mediaBlocks.push(media);
      toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(media?.result || {}) });
    }

    const second = await client.messages.create({
      model: model || 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools: ANTHROPIC_TOOLS,
      messages: [
        ...messages,
        { role: 'assistant', content: first.content },
        { role: 'user', content: toolResults },
      ],
    });
    text = second.content.filter(b => b.type === 'text').map(b => b.text).join('');
  }

  return appendMediaToContent(text, mediaBlocks);
}

// ─── Groq chat ────────────────────────────────────────────────────────────────

async function chatWithGroq(messages, systemPrompt) {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const enhancedSystem = systemPrompt + '\n\nCRITICAL OUTPUT RULES:\n- For diagrams/visuals (math graphs, science illustrations, process flows, circuit diagrams, anatomy, geometry shapes, etc.), output EXACTLY this on its own line: [WANTS_IMAGE: very detailed description of what to draw, including labels, colors, style]\n- For educational videos only when user asks, output EXACTLY: [WANTS_VIDEO: specific YouTube search query]\n- Use [WANTS_IMAGE:] GENEROUSLY — for any math concept, science topic, or process that benefits from visualization\n- Maximum 2 images per response\n- NEVER truncate your answer — always give the complete explanation';

  const groqMessages = [{ role: 'system', content: enhancedSystem }, ...messages];

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    messages: groqMessages,
  });

  const rawText = response.choices[0].message.content || '';

  // Parse [WANTS_IMAGE:] and [WANTS_VIDEO:] markers
  const mediaBlocks = [];
  const cleanLines = [];

  for (const line of rawText.split('\n')) {
    const imgMatch = line.match(/^\[WANTS_IMAGE:\s*(.+)\]$/i);
    const vidMatch = line.match(/^\[WANTS_VIDEO:\s*(.+)\]$/i);

    if (imgMatch) {
      const url = buildImageUrl(imgMatch[1].trim());
      mediaBlocks.push({ type: 'image', url, title: imgMatch[1].trim().slice(0, 60) });
    } else if (vidMatch) {
      const video = await findVideo(vidMatch[1].trim(), vidMatch[1].trim().slice(0, 50));
      mediaBlocks.push({ type: 'video', title: vidMatch[1].trim().slice(0, 50), ...video });
    } else {
      cleanLines.push(line);
    }
  }

  return appendMediaToContent(cleanLines.join('\n').trim(), mediaBlocks);
}

// ─── Pollinations free AI (no API key needed) ────────────────────────────────

async function chatWithPollinations(messages, systemPrompt) {
  const body = {
    model: 'openai-large',
    messages: [
      {
        role: 'system',
        content: systemPrompt + '\n\nIMPORTANT FORMATTING RULES:\n- When a visual diagram or image would help understanding, output a line starting exactly with: [WANTS_IMAGE: detailed description of what to draw]\n- When user explicitly asks for a video, output a line starting exactly with: [WANTS_VIDEO: optimized YouTube search query]\n- Only use these tags when genuinely useful. Use each at most once per response.',
      },
      ...messages,
    ],
    seed: Math.floor(Math.random() * 9999),
  };

  const res = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Pollinations error: ${res.status}`);
  const text = await res.text();

  // Parse [WANTS_IMAGE:] and [WANTS_VIDEO:] markers
  const mediaBlocks = [];
  const lines = text.split('\n');
  const cleanLines = [];

  for (const line of lines) {
    const imgMatch = line.match(/^\[WANTS_IMAGE:\s*(.+)\]$/i);
    const vidMatch = line.match(/^\[WANTS_VIDEO:\s*(.+)\]$/i);

    if (imgMatch) {
      const url = buildImageUrl(imgMatch[1].trim());
      const title = imgMatch[1].trim().slice(0, 60);
      mediaBlocks.push({ type: 'image', url, title });
    } else if (vidMatch) {
      const video = await findVideo(vidMatch[1].trim(), vidMatch[1].trim().slice(0, 50));
      mediaBlocks.push({ type: 'video', title: vidMatch[1].trim().slice(0, 50), ...video });
    } else {
      cleanLines.push(line);
    }
  }

  return appendMediaToContent(cleanLines.join('\n').trim(), mediaBlocks);
}

// ─── Main AI dispatcher ───────────────────────────────────────────────────────

async function getAIResponse(apiMessages, systemPrompt, model) {
  const provider = getProvider();
  try {
    if (provider === 'anthropic') return await chatWithAnthropic(apiMessages, systemPrompt, model);
    if (provider === 'groq') return await chatWithGroq(apiMessages, systemPrompt);
    // Default: Pollinations free AI — no key needed
    return await chatWithPollinations(apiMessages, systemPrompt);
  } catch (err) {
    console.error(`AI error (${provider}):`, err.message);
    throw err;
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id })
      .select('title updatedAt createdAt messages')
      .sort({ updatedAt: -1 });
    res.json(sessions.map((s) => ({
      _id: s._id,
      title: s.title,
      updatedAt: s.updatedAt,
      createdAt: s.createdAt,
      preview: s.messages[0]?.content?.slice(0, 80).replace(/\[[^\]]+\]/g, '') || '',
      messageCount: s.messages.length,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/sessions', protect, async (req, res) => {
  try {
    const session = await ChatSession.create({ userId: req.user._id, title: req.body.title || 'New Chat', messages: [] });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sessions/:id/messages', protect, async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ messages: session.messages, title: session.title });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/sessions/:id/message', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Message content is required' });

    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.messages.push({ role: 'user', content: content.trim() });
    if (session.title === 'New Chat' && session.messages.filter(m => m.role === 'user').length === 1) {
      session.title = content.trim().slice(0, 50);
    }

    const user = await User.findById(req.user._id);
    const aiModel = user.settings?.aiModel || 'claude-sonnet-4-6';
    const eduLevel = user.settings?.educationLevel || 'Matric (9-10)';
    const systemPrompt = `You are EduAI — a world-class AI tutor and expert assistant for ${user.name}.

**STUDENT PROFILE:**
- Name: ${user.name}
- Education Level: ${eduLevel} (Pakistani curriculum)
- Always pitch your explanations, vocabulary, and complexity to this level
- For primary/middle levels: use simple words, fun examples, short sentences
- For Matric/FSc: use proper academic language, board exam style
- For university/masters/PhD: use advanced academic depth and research-level detail
- For teachers: provide pedagogical insights, teaching strategies, and curriculum context

You have deep expertise across ALL subjects and domains:

**SUBJECTS YOU MASTER:**
- Mathematics (algebra, calculus, statistics, geometry, trigonometry, linear algebra)
- Sciences (physics, chemistry, biology, astronomy, earth science)
- Computer Science (programming, algorithms, data structures, AI/ML, web dev, databases)
- Languages (grammar, essay writing, literature, linguistics)
- History & Geography (world history, civilizations, maps, geopolitics)
- Economics & Business (micro/macro economics, finance, accounting, marketing)
- Engineering (electrical, mechanical, civil, software)
- Medicine & Health (anatomy, physiology, pharmacology — educational only)
- Arts & Music (theory, history, techniques)
- Law & Philosophy (concepts, ethics, logic)
- Any other topic the student asks about

**HOW YOU RESPOND — ALWAYS:**
1. Give COMPLETE, DETAILED answers — never cut short
2. Use this EXACT formatting structure:
   - Start with a **bold title** of the concept
   - Use numbered lists for steps/processes
   - Use bullet points (- ) for key points/facts
   - Use **bold** for important terms
   - Use \`code blocks\` for formulas, code, equations
   - Add a "📌 Key Takeaway" section at the end
3. For MATH problems: show EVERY step clearly, explain why each step is done
4. For SCIENCE: explain the theory + real-world application
5. For CODE: provide working code with comments + explanation
6. Be thorough — a 200-word answer is better than a 50-word answer

**VISUAL LEARNING — CRITICAL:**
- For ANY math concept (geometry, graphs, equations): generate a diagram
- For ANY science topic (cells, circuits, atoms, forces): generate an illustration
- For processes/flows (photosynthesis, water cycle, algorithms): generate a diagram
- For historical events/maps: generate a visual
- Output [WANTS_IMAGE: detailed description] whenever a visual would help (use frequently!)

**PRACTICE & EXAMPLES:**
- Always include at least 1 worked example
- Offer practice problems when relevant
- Quiz the student if they ask

Remember: ${user.name} deserves the BEST possible explanation. Be their personal Einstein, Turing, and Feynman combined.`;

    const apiMessages = session.messages.map(m => ({ role: m.role, content: m.content }));

    let aiContent;
    try {
      aiContent = await getAIResponse(apiMessages, systemPrompt, aiModel);
    } catch (err) {
      aiContent = `Sorry, I encountered an error: ${err.message}. Please check your API key in \`server/.env\` and restart the server.`;
    }

    session.messages.push({ role: 'assistant', content: aiContent });
    user.aiCreditsUsed = (user.aiCreditsUsed || 0) + 1;

    // Update streak: increment if last study was yesterday or today, reset if missed a day
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate).toISOString().slice(0, 10) : null;
    if (lastStudy !== todayStr) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yestStr = yesterday.toISOString().slice(0, 10);
      user.streak = lastStudy === yestStr ? (user.streak || 0) + 1 : 1;
      user.lastStudyDate = now;
    }

    await user.save();
    await session.save();

    const saved = session.messages[session.messages.length - 1];
    res.json({ message: saved, sessionTitle: session.title });
  } catch (err) {
    console.error('Send message error:', err.message);
    res.status(500).json({ message: 'Server error processing message' });
  }
});

router.delete('/sessions/:id', protect, async (req, res) => {
  try {
    const session = await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
