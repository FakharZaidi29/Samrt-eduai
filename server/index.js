import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import plannerRoutes from './routes/planner.js';
import analyticsRoutes from './routes/analytics.js';
import User from './models/User.js';
import StudyPlan from './models/StudyPlan.js';
import ChatSession from './models/ChatSession.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://smart-edu-ai.netlify.app',
  'https://sunny-mousse-cb3e62.netlify.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Image proxy — fetches from Pollinations on server side, avoids browser CORS/CSP issues
app.get('/api/media/image', async (req, res) => {
  const { prompt, seed } = req.query;
  if (!prompt) return res.status(400).json({ message: 'prompt required' });

  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=500&nologo=true&seed=${seed || Math.floor(Math.random() * 999999)}&model=flux`;

  try {
    const imgRes = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(60000) });
    if (!imgRes.ok) return res.status(502).send('Image generation failed');

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const buffer = await imgRes.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Image proxy error:', err.message);
    res.status(502).send('Image proxy failed');
  }
});

async function seedDemoAccount() {
  const exists = await User.findOne({ email: 'demo@eduai.com' });
  if (exists) return;

  const demo = await User.create({
    name: 'Alex Johnson',
    email: 'demo@eduai.com',
    password: 'demo123',
    streak: 7,
    totalStudyHours: 24.5,
    aiCreditsUsed: 320,
    aiCreditsLimit: 500,
  });

  await StudyPlan.create({
    userId: demo._id,
    title: 'Machine Learning Fundamentals',
    totalDuration: '4 weeks',
    difficulty: 'Intermediate',
    totalModules: 8,
    completedModules: 2,
    modules: [
      { title: 'Introduction to ML & Python Basics', duration: '3 days', status: 'completed', topics: ['What is Machine Learning?', 'Types of learning', 'Python for ML', 'NumPy & Pandas'], resources: 3 },
      { title: 'Data Preprocessing & Feature Engineering', duration: '4 days', status: 'completed', topics: ['Data cleaning', 'Normalisation & scaling', 'Feature selection', 'Handling missing data'], resources: 4 },
      { title: 'Supervised Learning: Regression', duration: '5 days', status: 'in-progress', topics: ['Linear Regression', 'Polynomial Regression', 'Regularisation (L1/L2)', 'Model evaluation metrics'], resources: 5 },
      { title: 'Supervised Learning: Classification', duration: '5 days', status: 'upcoming', topics: ['Logistic Regression', 'Decision Trees', 'Random Forests', 'Support Vector Machines'], resources: 6 },
      { title: 'Neural Networks & Deep Learning', duration: '5 days', status: 'upcoming', topics: ['Perceptrons & neurons', 'Backpropagation', 'Activation functions', 'Keras / PyTorch basics'], resources: 7 },
      { title: 'Unsupervised Learning', duration: '3 days', status: 'upcoming', topics: ['K-Means clustering', 'PCA & dimensionality reduction', 'Autoencoders', 'Anomaly detection'], resources: 4 },
      { title: 'Model Optimisation & Tuning', duration: '3 days', status: 'upcoming', topics: ['Hyperparameter tuning', 'Cross-validation', 'Bias–variance tradeoff', 'Grid & random search'], resources: 3 },
      { title: 'Final Project & Deployment', duration: '2 days', status: 'upcoming', topics: ['End-to-end ML project', 'Model serialisation', 'Flask REST API', 'MLOps overview'], resources: 5 },
    ],
  });

  const session = await ChatSession.create({
    userId: demo._id,
    title: 'Calculus Derivatives',
    messages: [
      { role: 'assistant', content: "Hello, Alex! I'm your AI tutor. I can explain concepts, solve problems, generate practice exercises, or help you review any topic in depth.\n\nWhat would you like to explore today?" },
      { role: 'user', content: 'Can you explain the chain rule in calculus with a clear example?' },
      { role: 'assistant', content: "**The Chain Rule**\n\nThe chain rule lets you differentiate **composite functions** — functions nested inside other functions.\n\n**Formula:**\n`d/dx [f(g(x))] = f'(g(x)) · g'(x)`\n\n**Example — differentiate h(x) = (x² + 3)⁵**\n\n- Outer function: f(u) = u⁵  →  f'(u) = 5u⁴\n- Inner function: g(x) = x² + 3  →  g'(x) = 2x\n\n**Applying the rule:**\n1. Differentiate outer, keep inner intact: 5(x² + 3)⁴\n2. Multiply by derivative of inner: × 2x\n\n**Result:** h'(x) = 10x(x² + 3)⁴\n\nWant me to walk through a harder example?" },
      { role: 'user', content: 'That makes total sense! Yes, give me a harder one.' },
      { role: 'assistant', content: "**Advanced Example — Nested Chain Rule**\n\nDifferentiate: y = sin(e^(x²))\n\nHere we have **three nested functions**:\n- Outermost: sin(u)\n- Middle: e^v\n- Innermost: x²\n\n**Step by step:**\n1. d/dx[sin(u)] = cos(u)  →  cos(e^(x²))\n2. d/dx[e^v] = e^v  →  e^(x²)\n3. d/dx[x²] = 2x\n\n**Multiply all together:**\n`y' = cos(e^(x²)) · e^(x²) · 2x`\n\nThe pattern: **each layer contributes one factor** to the final derivative. Try practicing with y = ln(cos(3x))!" },
    ],
  });

  await ChatSession.create({
    userId: demo._id,
    title: 'Python OOP Concepts',
    messages: [
      { role: 'assistant', content: "Welcome back! Ready to dive into Python OOP concepts. What would you like to cover — classes, inheritance, polymorphism, or something else?" },
      { role: 'user', content: 'Explain inheritance in Python with an example.' },
      { role: 'assistant', content: "**Python Inheritance**\n\nInheritance lets a class **reuse and extend** another class's functionality.\n\n**Basic syntax:**\n`class Child(Parent):`\n\n**Example:**\n- Base class: `Animal` with `name` and `speak()` method\n- Child class: `Dog` inherits from `Animal` and overrides `speak()`\n\n**Key benefits:**\n1. Code reuse — don't repeat common logic\n2. Method overriding — customise parent behaviour\n3. `super()` — call parent methods from child\n\nWant me to show a full working example with multiple levels of inheritance?" },
    ],
  });

  console.log('Demo account seeded: demo@eduai.com / demo123');
}

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedDemoAccount();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
