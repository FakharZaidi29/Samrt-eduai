import express from 'express';
import QuizResult from '../models/QuizResult.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Save a quiz result
router.post('/result', protect, async (req, res) => {
  try {
    const { subject, level, score, totalMarks, percentage, grade } = req.body;
    const result = await QuizResult.create({
      userId: req.user._id,
      userName: req.user.name,
      subject, level, score, totalMarks, percentage, grade,
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Save quiz result error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard — top 20 across all subjects
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = subject && subject !== 'all' ? { subject } : {};
    const results = await QuizResult.find(filter)
      .sort({ percentage: -1, score: -1, createdAt: -1 })
      .limit(20)
      .lean();
    // Add rank
    const ranked = results.map((r, i) => ({ ...r, rank: i + 1 }));
    res.json(ranked);
  } catch (err) {
    console.error('Leaderboard error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// My best results
router.get('/my-results', protect, async (req, res) => {
  try {
    const results = await QuizResult.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
