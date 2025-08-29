import mongoose, { Document, Schema } from 'mongoose';

export interface IMaterial extends Document {
  _id: string;
  title: string;
  description?: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  category: string;
  isVisible: boolean;
  uploadedAt: Date;
  updatedAt: Date;
}

const MaterialSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['document', 'video', 'audio', 'image', 'other'],
    default: 'document'
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Обновляем updatedAt при каждом сохранении
MaterialSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema);