import mongoose, { Schema, Document } from 'mongoose';

export interface ICriticalTask extends Document {
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  sampleAnswer: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserTaskResult extends Document {
  user: mongoose.Types.ObjectId;
  task: mongoose.Types.ObjectId;
  answer: string;
  feedback: string;
  score: number;
  timeSpent: number; // в секундах
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CriticalTaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Пожалуйста, укажите название задания'],
      trim: true,
      maxlength: [100, 'Название не может быть длиннее 100 символов'],
    },
    description: {
      type: String,
      required: [true, 'Пожалуйста, укажите описание задания'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Пожалуйста, укажите содержание задания'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Пожалуйста, укажите категорию задания'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    sampleAnswer: {
      type: String,
      required: [true, 'Пожалуйста, укажите пример ответа'],
      trim: true,
    },
  },
  { timestamps: true }
);

const UserTaskResultSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CriticalTask',
      required: true,
    },
    answer: {
      type: String,
      required: [true, 'Пожалуйста, укажите ответ пользователя'],
      trim: true,
    },
    feedback: {
      type: String,
      trim: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const CriticalTask = mongoose.models.CriticalTask || mongoose.model<ICriticalTask>('CriticalTask', CriticalTaskSchema);
const UserTaskResult = mongoose.models.UserTaskResult || mongoose.model<IUserTaskResult>('UserTaskResult', UserTaskResultSchema);

export interface ICriticalThinkingQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  textExplanation?: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'logic' | 'analysis' | 'reasoning' | 'comprehension' | 'evaluation';
  tags: string[];
  imageUrl?: string;
  imagePath?: string;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICriticalThinkingExam extends Document {
  title: string;
  description: string;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questions: mongoose.Types.ObjectId[];
  maxQuestions: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CriticalThinkingQuestionSchema: Schema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, required: true, trim: true },
    textExplanation: { type: String, trim: true },
    hint: { type: String, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    category: { type: String, enum: ['logic', 'analysis', 'reasoning', 'comprehension', 'evaluation'], default: 'logic' },
    tags: [{ type: String, trim: true }],
    imageUrl: { type: String, trim: true },
    imagePath: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Indexes for performance
CriticalThinkingQuestionSchema.index({ category: 1, difficulty: 1, isActive: 1 });
CriticalThinkingQuestionSchema.index({ createdBy: 1 });
CriticalThinkingQuestionSchema.index({ tags: 1 });

const CriticalThinkingExamSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true },
    timeLimit: { type: Number, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CriticalThinkingQuestion' }],
    maxQuestions: { type: Number, default: 30 },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Indexes
CriticalThinkingExamSchema.index({ isPublished: 1, createdAt: -1 });
CriticalThinkingExamSchema.index({ createdBy: 1 });

// Virtuals
CriticalThinkingExamSchema.virtual('questionCount').get(function (this: any) {
  return this.questions ? this.questions.length : 0;
});

// Pre-save hook to set publishedAt
CriticalThinkingExamSchema.pre('save', function (this: any, next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const CriticalThinkingQuestion =
  mongoose.models.CriticalThinkingQuestion ||
  mongoose.model<ICriticalThinkingQuestion>('CriticalThinkingQuestion', CriticalThinkingQuestionSchema);

const CriticalThinkingExam =
  mongoose.models.CriticalThinkingExam ||
  mongoose.model<ICriticalThinkingExam>('CriticalThinkingExam', CriticalThinkingExamSchema);

export { CriticalTask, UserTaskResult, CriticalThinkingQuestion, CriticalThinkingExam };