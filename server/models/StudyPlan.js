import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: String, default: '3 days' },
    status: {
      type: String,
      enum: ['upcoming', 'in-progress', 'completed'],
      default: 'upcoming',
    },
    topics: [{ type: String }],
    resources: { type: Number, default: 3 },
  },
  { _id: true }
);

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    totalDuration: {
      type: String,
      default: '4 weeks',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    totalModules: {
      type: Number,
      default: 0,
    },
    completedModules: {
      type: Number,
      default: 0,
    },
    modules: [moduleSchema],
  },
  { timestamps: true }
);

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
export default StudyPlan;
