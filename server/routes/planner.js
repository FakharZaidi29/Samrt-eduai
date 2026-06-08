import express from 'express';
import Groq from 'groq-sdk';
import StudyPlan from '../models/StudyPlan.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

async function generatePlanJSON(topic, difficulty, duration) {
  const prompt = `Create a detailed study plan for learning "${topic}" at ${difficulty || 'Intermediate'} level over ${duration || '1 month'}.

Return ONLY valid JSON (no markdown, no explanation, no code fences) in exactly this format:
{
  "title": "Study Plan Title",
  "totalDuration": "${duration || '1 month'}",
  "difficulty": "${difficulty || 'Intermediate'}",
  "totalModules": 6,
  "modules": [
    {
      "title": "Module Title",
      "duration": "3 days",
      "status": "upcoming",
      "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      "resources": 4
    }
  ]
}

Generate 5-8 modules with meaningful titles and 3-5 topics each. First module status must be "in-progress", rest "upcoming". Make it realistic and progressively structured.`;

  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_')) {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'You are an expert curriculum designer. Return ONLY valid JSON with no markdown, no explanation, no code fences. Just raw JSON.' },
        { role: 'user', content: prompt },
      ],
    });
    const raw = response.choices[0].message.content.trim();
    const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(jsonText);
  }

  throw new Error('No AI provider configured');
}

router.get('/', protect, async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error('Get plans error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/generate', protect, async (req, res) => {
  try {
    const { topic, difficulty, duration } = req.body;
    if (!topic || !topic.trim()) return res.status(400).json({ message: 'Topic is required' });

    let planData;
    try {
      planData = await generatePlanJSON(topic.trim(), difficulty, duration);
    } catch (parseErr) {
      console.error('AI/parse error:', parseErr.message);
      return res.status(500).json({ message: 'Failed to generate study plan. Please try again.' });
    }

    if (planData.modules?.length > 0) planData.modules[0].status = 'in-progress';

    const plan = await StudyPlan.create({
      userId: req.user._id,
      title: planData.title || topic,
      totalDuration: planData.totalDuration || duration || '1 month',
      difficulty: planData.difficulty || difficulty || 'Intermediate',
      totalModules: planData.modules?.length || 0,
      completedModules: 0,
      modules: planData.modules || [],
    });

    res.status(201).json(plan);
  } catch (err) {
    console.error('Generate plan error:', err.message);
    res.status(500).json({ message: 'Server error generating study plan' });
  }
});

router.put('/:id/modules/:moduleId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const module = plan.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    module.status = status;
    plan.completedModules = plan.modules.filter((m) => m.status === 'completed').length;
    await plan.save();
    res.json(plan);
  } catch (err) {
    console.error('Update module error:', err.message);
    res.status(500).json({ message: 'Server error updating module' });
  }
});

router.put('/:id/modules/:moduleId/notes', protect, async (req, res) => {
  try {
    const { notes } = req.body;
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    const module = plan.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    module.notes = notes || '';
    await plan.save();
    res.json(plan);
  } catch (err) {
    console.error('Save notes error:', err.message);
    res.status(500).json({ message: 'Server error saving notes' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    console.error('Delete plan error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
