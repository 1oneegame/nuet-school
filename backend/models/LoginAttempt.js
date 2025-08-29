const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  // Информация о пользователе
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Может быть null для неуспешных попыток с несуществующим email
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  // Результат попытки входа
  success: {
    type: Boolean,
    required: true,
    default: false
  },
  
  // Причина неудачи (если success = false)
  failureReason: {
    type: String,
    enum: [
      'INVALID_CREDENTIALS', // Неверный пароль
      'USER_NOT_FOUND',      // Пользователь не найден
      'ACCOUNT_LOCKED',      // Аккаунт заблокирован
      'EMAIL_NOT_VERIFIED',  // Email не подтвержден
      'WHATSAPP_NOT_VERIFIED', // WhatsApp не подтвержден
      'NO_STUDENT_ACCESS',   // Нет доступа к студенческому дашборду
      'INVALID_TOKEN',       // Недействительный JWT токен
      'TOKEN_EXPIRED',       // Истекший JWT токен
      'RATE_LIMITED',        // Превышен лимит попыток
      'VALIDATION_ERROR',    // Ошибка валидации данных
      'SERVER_ERROR'         // Внутренняя ошибка сервера
    ],
    required: function() {
      return !this.success;
    }
  },
  
  // Информация о сессии и устройстве
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  
  // Геолокация (если доступна)
  location: {
    country: String,
    city: String,
    region: String,
    timezone: String
  },
  
  // Информация об устройстве
  deviceInfo: {
    browser: String,
    os: String,
    device: String,
    isMobile: Boolean
  },
  
  // Дополнительные метаданные
  loginMethod: {
    type: String,
    enum: ['EMAIL_PASSWORD', 'TOKEN_REFRESH', 'ADMIN_LOGIN'],
    default: 'EMAIL_PASSWORD'
  },
  
  // Время попытки
  attemptedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Время сессии (для успешных входов)
  sessionDuration: {
    type: Number, // в миллисекундах
    required: false
  },
  
  // Флаги безопасности
  isSuspicious: {
    type: Boolean,
    default: false
  },
  suspiciousReasons: [{
    type: String,
    enum: [
      'MULTIPLE_FAILED_ATTEMPTS',
      'UNUSUAL_LOCATION',
      'UNUSUAL_DEVICE',
      'RAPID_ATTEMPTS',
      'BRUTE_FORCE_PATTERN'
    ]
  }],
  
  // Дополнительные данные для анализа
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'loginattempts'
});

// Индексы для оптимизации запросов
loginAttemptSchema.index({ email: 1, attemptedAt: -1 });
loginAttemptSchema.index({ userId: 1, attemptedAt: -1 });
loginAttemptSchema.index({ ipAddress: 1, attemptedAt: -1 });
loginAttemptSchema.index({ success: 1, attemptedAt: -1 });
loginAttemptSchema.index({ attemptedAt: -1 }); // Для общей сортировки по времени
loginAttemptSchema.index({ isSuspicious: 1, attemptedAt: -1 });

// Составной индекс для анализа безопасности
loginAttemptSchema.index({ 
  email: 1, 
  ipAddress: 1, 
  success: 1, 
  attemptedAt: -1 
});

// Виртуальные поля
loginAttemptSchema.virtual('isRecent').get(function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.attemptedAt > oneHourAgo;
});

loginAttemptSchema.virtual('formattedAttemptTime').get(function() {
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

// Статические методы для анализа
loginAttemptSchema.statics.getFailedAttemptsCount = function(email, timeWindow = 60) {
  const since = new Date(Date.now() - timeWindow * 60 * 1000);
  return this.countDocuments({
    email: email.toLowerCase(),
    success: false,
    attemptedAt: { $gte: since }
  });
};

loginAttemptSchema.statics.getRecentAttemptsByIP = function(ipAddress, timeWindow = 60) {
  const since = new Date(Date.now() - timeWindow * 60 * 1000);
  return this.find({
    ipAddress,
    attemptedAt: { $gte: since }
  }).sort({ attemptedAt: -1 });
};

loginAttemptSchema.statics.getSuspiciousActivity = function(limit = 50) {
  return this.find({
    $or: [
      { isSuspicious: true },
      { success: false },
      { failureReason: { $in: ['ACCOUNT_LOCKED', 'RATE_LIMITED'] } }
    ]
  })
  .populate('userId', 'email firstName lastName role')
  .sort({ attemptedAt: -1 })
  .limit(limit);
};

loginAttemptSchema.statics.getLoginStatistics = function(days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    { $match: { attemptedAt: { $gte: since } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$attemptedAt" } },
          success: "$success"
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        successful: {
          $sum: { $cond: [{ $eq: ["$_id.success", true] }, "$count", 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ["$_id.success", false] }, "$count", 0] }
        },
        total: { $sum: "$count" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Методы экземпляра
loginAttemptSchema.methods.markAsSuspicious = function(reasons = []) {
  this.isSuspicious = true;
  this.suspiciousReasons = [...new Set([...this.suspiciousReasons, ...reasons])];
  return this.save();
};

loginAttemptSchema.methods.updateSessionDuration = function() {
  if (this.success && this.attemptedAt) {
    this.sessionDuration = Date.now() - this.attemptedAt.getTime();
    return this.save();
  }
  return Promise.resolve(this);
};

// Middleware для автоматического определения подозрительной активности
loginAttemptSchema.pre('save', async function(next) {
  if (this.isNew && !this.success) {
    // Проверяем количество неудачных попыток за последний час
    const recentFailures = await this.constructor.getFailedAttemptsCount(this.email, 60);
    
    if (recentFailures >= 5) {
      this.isSuspicious = true;
      this.suspiciousReasons.push('MULTIPLE_FAILED_ATTEMPTS');
    }
    
    // Проверяем быстрые повторные попытки
    const lastAttempt = await this.constructor.findOne({
      email: this.email,
      attemptedAt: { $gte: new Date(Date.now() - 60 * 1000) } // Последняя минута
    }).sort({ attemptedAt: -1 });
    
    if (lastAttempt && (this.attemptedAt - lastAttempt.attemptedAt) < 10000) { // Менее 10 секунд
      this.isSuspicious = true;
      this.suspiciousReasons.push('RAPID_ATTEMPTS');
    }
  }
  
  next();
});

// TTL индекс для автоматического удаления старых записей (через 90 дней)
loginAttemptSchema.index({ attemptedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);