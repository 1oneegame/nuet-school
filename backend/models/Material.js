import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['document', 'video', 'audio', 'image', 'other'],
    default: 'document'
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
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
  isVisible: {
    type: Boolean,
    default: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create indexes for better performance
MaterialSchema.index({ category: 1 });
MaterialSchema.index({ isVisible: 1 });
MaterialSchema.index({ uploadedAt: -1 });

const Material = mongoose.models.Material || mongoose.model('Material', MaterialSchema);

export default Material;