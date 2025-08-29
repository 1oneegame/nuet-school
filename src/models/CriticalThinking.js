const mongoose = require('mongoose');

const CriticalThinkingQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    required: true,
    trim: true
  },
  textExplanation: {
    type: String,
    trim: true
  },
  hint: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  imagePath: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['logic', 'analysis', 'reasoning', 'comprehension', 'evaluation'],
    default: 'logic'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const CriticalThinkingExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  timeLimit: {
    type: Number,
    required: true,
    min: 1
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CriticalThinkingQuestion'
  }],
  maxQuestions: {
    type: Number,
    default: 30
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
CriticalThinkingQuestionSchema.index({ category: 1, difficulty: 1, isActive: 1 });
CriticalThinkingQuestionSchema.index({ createdBy: 1 });
CriticalThinkingQuestionSchema.index({ tags: 1 });

CriticalThinkingExamSchema.index({ isPublished: 1, createdAt: -1 });
CriticalThinkingExamSchema.index({ createdBy: 1 });

// Virtual for question count
CriticalThinkingExamSchema.virtual('questionCount').get(function() {
  return this.questions ? this.questions.length : 0;
});

// Pre-save middleware to set publishedAt
CriticalThinkingExamSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const CriticalThinkingQuestion = mongoose.models.CriticalThinkingQuestion || mongoose.model('CriticalThinkingQuestion', CriticalThinkingQuestionSchema);
const CriticalThinkingExam = mongoose.models.CriticalThinkingExam || mongoose.model('CriticalThinkingExam', CriticalThinkingExamSchema);

module.exports = {
  CriticalThinkingQuestion,
  CriticalThinkingExam
};