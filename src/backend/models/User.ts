import mongoose, { Schema, Document, Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  whatsappNumber: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Student' | 'User';
  hasStudentAccess: boolean;
  isSchoolStudent: boolean;
  isEmailVerified: boolean;
  isWhatsappVerified: boolean;
  whatsappVerificationCode?: string;
  whatsappVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  isActive: boolean;
  registrationDate: Date;
  accessGrantedBy?: string;
  accessGrantedAt?: Date;
  accessRevokedBy?: string;
  accessRevokedAt?: Date;
  accessRevokedReason?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Пожалуйста, введите корректный email']
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    whatsappNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Пожалуйста, введите корректный WhatsApp номер']
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    role: {
      type: String,
      enum: ['Admin', 'Student', 'User'],
      default: 'User'
    },
    hasStudentAccess: {
      type: Boolean,
      default: false
    },
    isSchoolStudent: {
      type: Boolean,
      default: false
    },
    isEmailVerified: {
      type: Boolean,
      default: true // Auto-verify all emails for simplicity
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
    lastLogin: {
      type: Date
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    accessGrantedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    accessGrantedAt: {
      type: Date
    },
    accessRevokedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    accessRevokedAt: {
      type: Date
    },
    accessRevokedReason: {
      type: String,
      trim: true
    },
    lastLoginAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Хеширование пароля перед сохранением
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Метод для сравнения паролей
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Проверка, существует ли уже модель, чтобы избежать ошибки переопределения
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;