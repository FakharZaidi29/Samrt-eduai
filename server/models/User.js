import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    streak: {
      type: Number,
      default: 0,
    },
    totalStudyHours: {
      type: Number,
      default: 0,
    },
    aiCreditsUsed: {
      type: Number,
      default: 0,
    },
    aiCreditsLimit: {
      type: Number,
      default: 500,
    },
    settings: {
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: 'English' },
      educationLevel: { type: String, default: 'Matric (9-10)' },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: false },
      studyReminders: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
      aiModel: { type: String, default: 'claude-sonnet-4-6' },
      autoSaveNotes: { type: Boolean, default: true },
      soundEffects: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
