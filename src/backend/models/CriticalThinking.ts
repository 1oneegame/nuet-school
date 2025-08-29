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

export { CriticalTask, UserTaskResult };