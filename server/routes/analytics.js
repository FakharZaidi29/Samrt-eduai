import express from 'express';
import StudyPlan from '../models/StudyPlan.js';
import ChatSession from '../models/ChatSession.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all plans for user
    const plans = await StudyPlan.find({ userId });

    // Aggregate stats from plans
    const totalModulesCompleted = plans.reduce((sum, p) => sum + (p.completedModules || 0), 0);
    const totalModules = plans.reduce((sum, p) => sum + (p.totalModules || 0), 0);
    const weeklyProgress = totalModules > 0
      ? Math.round((totalModulesCompleted / totalModules) * 100)
      : 0;

    // Get chat sessions count
    const totalChats = await ChatSession.countDocuments({ userId });

    // Get user data
    const user = await User.findById(userId);

    res.json({
      totalStudyHours: user.totalStudyHours || 0,
      tasksCompleted: totalModulesCompleted,
      aiCreditsUsed: user.aiCreditsUsed || 0,
      aiCreditsLimit: user.aiCreditsLimit || 500,
      weeklyProgress,
      totalPlans: plans.length,
      totalChats,
      streak: user.streak || 0,
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/analytics/log-session
router.post('/log-session', protect, async (req, res) => {
  try {
    const { hours } = req.body;
    const user = await User.findById(req.user._id);
    user.totalStudyHours = (user.totalStudyHours || 0) + (hours || 1);
    await user.save();
    res.json({ totalStudyHours: user.totalStudyHours });
  } catch (err) {
    console.error('Log session error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
