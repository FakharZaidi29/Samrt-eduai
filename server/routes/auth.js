import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

function getMailer() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
}

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
    const { name, language, educationLevel, darkMode, emailNotifications, pushNotifications,
      studyReminders, weeklyReport, aiModel, autoSaveNotes, soundEffects } = req.body;

    if (name !== undefined) user.name = name;
    if (language !== undefined) user.settings.language = language;
    if (educationLevel !== undefined) user.settings.educationLevel = educationLevel;
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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide your email address' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always respond success to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'https://smart-edu-ai.netlify.app';
    const resetUrl = `${frontendUrl}/reset-password/${token}`;

    const mailer = getMailer();
    await mailer.sendMail({
      from: `"EduAI 🎓" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: 'Reset your EduAI password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
          <h2 style="color:#2563eb">EduAI 🎓</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
            Reset Password
          </a>
          <p style="color:#666;font-size:13px">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="color:#aaa;font-size:12px">EduAI — Pakistan's AI-powered learning platform 🇵🇰</p>
        </div>
      `,
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired.' });

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

export default router;
