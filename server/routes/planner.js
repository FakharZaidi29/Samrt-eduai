import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import StudyPlan from '../models/StudyPlan.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const getAnthropicClient = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// GET /api/planner
router.get('/', protect, async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error('Get plans error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/planner/generate
router.post('/generate', protect, async (req, res) => {
  try {
    const { topic, difficulty, duration } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const user = await User.findById(req.user._id);
    const aiModel = user.settings?.aiModel || 'claude-sonnet-4-6';

    const prompt = `Create a detailed study plan for learning "${topic}" at ${difficulty || 'Intermediate'} level over ${duration || '1 month'}.

Return ONLY valid JSON (no markdown, no explanation) in exactly this format:
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

Generate 5-8 modules with meaningful titles and 3-5 topics each. The first module should have status "in-progress", all others "upcoming". Make it realistic and progressively structured.`;

    let planData;
    try {
      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: aiModel,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });

      const rawText = response.content[0].text.trim();
      // Strip markdown code fences if present
      const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      planData = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error('AI/parse error:', parseErr.message);
      return res.status(500).json({ message: 'Failed to generate study plan. Please try again.' });
    }

    // Ensure first module is in-progress
    if (planData.modules && planData.modules.length > 0) {
      planData.modules[0].status = 'in-progress';
    }

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

// PUT /api/planner/:id/modules/:moduleId
router.put('/:id/modules/:moduleId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const module = plan.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    module.status = status;

    // Recalculate completedModules
    plan.completedModules = plan.modules.filter((m) => m.status === 'completed').length;

    await plan.save();
    res.json(plan);
  } catch (err) {
    console.error('Update module error:', err.message);
    res.status(500).json({ message: 'Server error updating module' });
  }
});

// DELETE /api/planner/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    console.error('Delete plan error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
