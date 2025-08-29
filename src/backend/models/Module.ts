import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  duration: string;
  videoUrl?: string;
  theoryPdf?: string;
  homeworkPdf?: string;
  completed: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IModule extends Document {
  title: string;
  description: string;
  lessons: ILesson[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Пожалуйста, укажите название урока'],
      trim: true,
      maxlength: [200, 'Название не может быть длиннее 200 символов'],
    },
    duration: {
      type: String,
      required: [true, 'Пожалуйста, укажите длительность урока'],
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    theoryPdf: {
      type: String,
      trim: true,
    },
    homeworkPdf: {
      type: String,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const ModuleSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Пожалуйста, укажите название модуля'],
      trim: true,
      maxlength: [200, 'Название не может быть длиннее 200 символов'],
    },
    description: {
      type: String,
      required: [true, 'Пожалуйста, укажите описание модуля'],
      trim: true,
    },
    lessons: [LessonSchema],
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Module = mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema);

export default Module;