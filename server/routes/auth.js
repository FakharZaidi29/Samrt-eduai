import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists with that email' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
        totalStudyHours: user.totalStudyHours,
        aiCreditsUsed: user.aiCreditsUsed,
        aiCreditsLimit: user.aiCreditsLimit,
        settings: user.settings,
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
        totalStudyHours: user.totalStudyHours,
        aiCreditsUsed: user.aiCreditsUsed,
        aiCreditsLimit: user.aiCreditsLimit,
        settings: user.settings,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      streak: user.streak,
      totalStudyHours: user.totalStudyHours,
      aiCreditsUsed: user.aiCreditsUsed,
      aiCreditsLimit: user.aiCreditsLimit,
      settings: user.settings,
    });
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/settings
router.put('/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Update allowed fields
    const { name, language, darkMode, emailNotifications, pushNotifications,
      studyReminders, weeklyReport, aiModel, autoSaveNotes, soundEffects } = req.body;

    if (name !== undefined) user.name = name;
    if (language !== undefined) user.settings.language = language;
    if (darkMode !== undefined) user.settings.darkMode = darkMode;
    if (emailNotifications !== undefined) user.settings.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) user.settings.pushNotifications = pushNotifications;
    if (studyReminders !== undefined) user.settings.studyReminders = studyReminders;
    if (weeklyReport !== undefined) user.settings.weeklyReport = weeklyReport;
    if (aiModel !== undefined) user.settings.aiModel = aiModel;
    if (autoSaveNotes !== undefined) user.settings.autoSaveNotes = autoSaveNotes;
    if (soundEffects !== undefined) user.settings.soundEffects = soundEffects;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      streak: user.streak,
      totalStudyHours: user.totalStudyHours,
      aiCreditsUsed: user.aiCreditsUsed,
      aiCreditsLimit: user.aiCreditsLimit,
      settings: user.settings,
    });
  } catch (err) {
    console.error('Settings error:', err.message);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

export default router;
