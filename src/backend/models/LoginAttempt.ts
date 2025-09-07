import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILocationInfo {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
}

export interface IDeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
  isMobile: boolean;
}

export type FailureReason =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'ACCOUNT_LOCKED'
  | 'EMAIL_NOT_VERIFIED'
  | 'WHATSAPP_NOT_VERIFIED'
  | 'NO_STUDENT_ACCESS'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR';

export type SuspiciousReason =
  | 'MULTIPLE_FAILED_ATTEMPTS'
  | 'UNUSUAL_LOCATION'
  | 'UNUSUAL_DEVICE'
  | 'RAPID_ATTEMPTS'
  | 'BRUTE_FORCE_PATTERN';

export interface ILoginAttempt extends Document {
  userId?: mongoose.Types.ObjectId | null;
  email: string;
  success: boolean;
  failureReason?: FailureReason;
  ipAddress: string;
  userAgent: string;
  location?: ILocationInfo;
  deviceInfo?: IDeviceInfo;
  loginMethod?: 'EMAIL_PASSWORD' | 'TOKEN_REFRESH' | 'ADMIN_LOGIN';
  attemptedAt: Date;
  isSuspicious: boolean;
  suspiciousReasons: SuspiciousReason[];
  sessionDuration?: number;
  metadata?: any;

  markAsSuspicious(reasons?: SuspiciousReason[]): Promise<ILoginAttempt>;
  updateSessionDuration(): Promise<ILoginAttempt>;
}

interface ILoginAttemptModel extends Model<ILoginAttempt> {
  getLoginStatistics(days: number): Promise<any[]>;
  getSuspiciousActivity(limit: number): Promise<ILoginAttempt[]>;
  getFailedAttemptsCount(email: string, timeWindow?: number): Promise<number>;
  getRecentAttemptsByIP(ipAddress: string, timeWindow?: number): Promise<ILoginAttempt[]>;
}

const LocationSchema = new Schema<ILocationInfo>({
  country: { type: String, trim: true },
  city: { type: String, trim: true },
  region: { type: String, trim: true },
  timezone: { type: String, trim: true }
}, { _id: false });

const DeviceInfoSchema = new Schema<IDeviceInfo>({
  browser: { type: String, trim: true },
  os: { type: String, trim: true },
  device: { type: String, trim: true },
  isMobile: { type: Boolean, default: false }
}, { _id: false });

const LoginAttemptSchema = new Schema<ILoginAttempt>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  email: { type: String, required: true, lowercase: true, trim: true },
  success: { type: Boolean, required: true },
  failureReason: {
    type: String,
    enum: [
      'INVALID_CREDENTIALS',
      'USER_NOT_FOUND',
      'ACCOUNT_LOCKED',
      'EMAIL_NOT_VERIFIED',
      'WHATSAPP_NOT_VERIFIED',
      'NO_STUDENT_ACCESS',
      'INVALID_TOKEN',
      'TOKEN_EXPIRED',
      'RATE_LIMITED',
      'VALIDATION_ERROR',
      'SERVER_ERROR'
    ],
    required(this: any) {
      return !this.success;
    },
  },
  ipAddress: { type: String, required: true, trim: true },
  userAgent: { type: String, required: true, trim: true },
  location: { type: LocationSchema },
  deviceInfo: { type: DeviceInfoSchema },
  loginMethod: { type: String, enum: ['EMAIL_PASSWORD', 'TOKEN_REFRESH', 'ADMIN_LOGIN'], default: 'EMAIL_PASSWORD' },
  attemptedAt: { type: Date, required: true, default: () => new Date() },
  isSuspicious: { type: Boolean, default: false },
  suspiciousReasons: {
    type: [String],
    enum: ['MULTIPLE_FAILED_ATTEMPTS', 'UNUSUAL_LOCATION', 'UNUSUAL_DEVICE', 'RAPID_ATTEMPTS', 'BRUTE_FORCE_PATTERN'],
    default: [],
  },
  sessionDuration: { type: Number },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true, collection: 'loginattempts' });

LoginAttemptSchema.index({ email: 1, attemptedAt: -1 });
LoginAttemptSchema.index({ userId: 1, attemptedAt: -1 });
LoginAttemptSchema.index({ ipAddress: 1, attemptedAt: -1 });
LoginAttemptSchema.index({ success: 1, attemptedAt: -1 });
LoginAttemptSchema.index({ attemptedAt: -1 });
LoginAttemptSchema.index({ isSuspicious: 1, attemptedAt: -1 });
LoginAttemptSchema.index({ email: 1, ipAddress: 1, success: 1, attemptedAt: -1 });

// TTL index (90 days)
LoginAttemptSchema.index({ attemptedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

LoginAttemptSchema.statics.getLoginStatistics = async function(days: number): Promise<any[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.aggregate([
    { $match: { attemptedAt: { $gte: since } } },
    {
      $group: {
        _id: {
          y: { $year: '$attemptedAt' },
          m: { $month: '$attemptedAt' },
          d: { $dayOfMonth: '$attemptedAt' }
        },
        total: { $sum: 1 },
        success: { $sum: { $cond: ['$success', 1, 0] } },
        failed: { $sum: { $cond: ['$success', 0, 1] } }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.y', month: '$_id.m', day: '$_id.d'
          }
        },
        total: 1,
        success: 1,
        failed: 1,
        _id: 0
      }
    },
    { $sort: { date: 1 } }
  ]);
};

LoginAttemptSchema.statics.getSuspiciousActivity = async function(limit: number): Promise<ILoginAttempt[]> {
  return this.find({ isSuspicious: true }).sort({ attemptedAt: -1 }).limit(limit).populate('userId', 'email firstName lastName role');
};

LoginAttemptSchema.statics.getFailedAttemptsCount = function(email: string, timeWindow: number = 60) {
  const since = new Date(Date.now() - timeWindow * 60 * 1000);
  return this.countDocuments({ email: email.toLowerCase(), success: false, attemptedAt: { $gte: since } });
};

LoginAttemptSchema.statics.getRecentAttemptsByIP = function(ipAddress: string, timeWindow: number = 60) {
  const since = new Date(Date.now() - timeWindow * 60 * 1000);
  return this.find({ ipAddress, attemptedAt: { $gte: since } }).sort({ attemptedAt: -1 });
};

const LoginAttempt = (mongoose.models.LoginAttempt as ILoginAttemptModel) || mongoose.model<ILoginAttempt, ILoginAttemptModel>('LoginAttempt', LoginAttemptSchema);

// Virtuals
LoginAttemptSchema.virtual('isRecent').get(function (this: ILoginAttempt) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.attemptedAt > oneHourAgo;
});

LoginAttemptSchema.virtual('formattedAttemptTime').get(function (this: ILoginAttempt) {
  return this.attemptedAt.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Almaty'
  });
});

// Instance methods
LoginAttemptSchema.methods.markAsSuspicious = function (this: ILoginAttempt, reasons: SuspiciousReason[] = []) {
  this.isSuspicious = true;
  const set = new Set([...(this.suspiciousReasons || []), ...reasons]);
  this.suspiciousReasons = Array.from(set) as SuspiciousReason[];
  return this.save();
};

LoginAttemptSchema.methods.updateSessionDuration = function (this: ILoginAttempt) {
  if (this.success && this.attemptedAt) {
    this.sessionDuration = Date.now() - this.attemptedAt.getTime();
    return this.save();
  }
  return Promise.resolve(this);
};

// Pre-save suspicious detection
LoginAttemptSchema.pre('save', async function (this: any, next) {
  try {
    if (this.isNew && !this.success) {
      const recentFailures = await (this.constructor as ILoginAttemptModel).getFailedAttemptsCount(this.email, 60);
      if (recentFailures >= 5) {
        this.isSuspicious = true;
        this.suspiciousReasons = Array.from(new Set([...(this.suspiciousReasons || []), 'MULTIPLE_FAILED_ATTEMPTS']));
      }

      const lastAttempt = await (this.constructor as ILoginAttemptModel).findOne({
        email: this.email,
        attemptedAt: { $gte: new Date(Date.now() - 60 * 1000) }
      }).sort({ attemptedAt: -1 });

      if (lastAttempt && this.attemptedAt && (this.attemptedAt.getTime() - lastAttempt.attemptedAt.getTime()) < 10000) {
        this.isSuspicious = true;
        this.suspiciousReasons = Array.from(new Set([...(this.suspiciousReasons || []), 'RAPID_ATTEMPTS']));
      }
    }
    next();
  } catch (e) {
    next();
  }
});

export default LoginAttempt;

