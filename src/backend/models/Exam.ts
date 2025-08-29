import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  text: string;
  isCorrect: boolean;
}

export interface IQuestion extends Document {
  text: string;
  answers: IAnswer[];
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface IExam extends Document {
  title: string;
  description: string;
  questions: mongoose.Types.ObjectId[] | IQuestion[];
  timeLimit: number; // в минутах
  passingScore: number; // процент правильных ответов
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserExamResult extends Document {
  user: mongoose.Types.ObjectId;
  exam: mongoose.Types.ObjectId;
  score: number;
  answers: {
    question: mongoose.Types.ObjectId;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
  timeSpent: number; // в секундах
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema: Schema = new Schema({
  text: {
    type: String,
    required: [true, 'Пожалуйста, укажите текст ответа'],
    trim: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const QuestionSchema: Schema = new Schema({
  text: {
    type: String,
    required: [true, 'Пожалуйста, укажите текст вопроса'],
    trim: true,
  },
  answers: {
    type: [AnswerSchema],
    validate: {
      validator: function(answers: IAnswer[]) {
        return answers.length >= 2 && answers.some(answer => answer.isCorrect);
      },
      message: 'Должно быть минимум 2 ответа и хотя бы один правильный',
    },
  },
  explanation: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Пожалуйста, укажите категорию вопроса'],
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
});

const ExamSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Пожалуйста, укажите название экзамена'],
      trim: true,
      maxlength: [100, 'Название не может быть длиннее 100 символов'],
    },
    description: {
      type: String,
      required: [true, 'Пожалуйста, укажите описание экзамена'],
      trim: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    timeLimit: {
      type: Number,
      required: [true, 'Пожалуйста, укажите временное ограничение'],
      default: 60, // 60 минут по умолчанию
    },
    passingScore: {
      type: Number,
      required: [true, 'Пожалуйста, укажите проходной балл'],
      default: 70, // 70% по умолчанию
    },
  },
  { timestamps: true }
);

const UserExamResultSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedAnswer: {
          type: Number,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
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

const Question = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
const Exam = mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);
const UserExamResult = mongoose.models.UserExamResult || mongoose.model<IUserExamResult>('UserExamResult', UserExamResultSchema);

export { Question, Exam, UserExamResult };