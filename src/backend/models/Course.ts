import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  url: string;
  duration: number; // в секундах
  order: number;
}

export interface ITopic extends Document {
  title: string;
  description: string;
  videos: IVideo[];
  order: number;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  imageUrl: string;
  topics: ITopic[];
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Пожалуйста, укажите название видео'],
    trim: true,
    maxlength: [100, 'Название не может быть длиннее 100 символов'],
  },
  description: {
    type: String,
    required: [true, 'Пожалуйста, укажите описание видео'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Пожалуйста, укажите URL видео'],
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'Пожалуйста, укажите длительность видео'],
  },
  order: {
    type: Number,
    default: 0,
  },
});

const TopicSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Пожалуйста, укажите название темы'],
    trim: true,
    maxlength: [100, 'Название не может быть длиннее 100 символов'],
  },
  description: {
    type: String,
    required: [true, 'Пожалуйста, укажите описание темы'],
    trim: true,
  },
  videos: [VideoSchema],
  order: {
    type: Number,
    default: 0,
  },
});

const CourseSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Пожалуйста, укажите название курса'],
      trim: true,
      maxlength: [100, 'Название не может быть длиннее 100 символов'],
    },
    description: {
      type: String,
      required: [true, 'Пожалуйста, укажите описание курса'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Пожалуйста, укажите URL изображения курса'],
      trim: true,
    },
    topics: [TopicSchema],
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;