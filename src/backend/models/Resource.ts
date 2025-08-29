import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  type: 'book' | 'article' | 'video' | 'website' | 'tool' | 'other';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Пожалуйста, укажите название ресурса'],
      trim: true,
      maxlength: [100, 'Название не может быть длиннее 100 символов'],
    },
    description: {
      type: String,
      required: [true, 'Пожалуйста, укажите описание ресурса'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Пожалуйста, укажите URL ресурса'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Пожалуйста, укажите URL изображения ресурса'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['book', 'article', 'video', 'website', 'tool', 'other'],
      required: [true, 'Пожалуйста, укажите тип ресурса'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

const Resource = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);

export default Resource;