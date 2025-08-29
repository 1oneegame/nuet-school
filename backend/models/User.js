const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    default: false,
    description: 'Отмечает, является ли пользователь учеником школы (true) или внешним пользователем (false)'
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  accessGrantedAt: {
    type: Date
  },
  accessRevokedBy: {
    type: mongoose.Schema.Types.ObjectId,
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
}, {
  timestamps: true
});

// Виртуальное поле для проверки блокировки аккаунта
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Виртуальное поле для полного имени
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Виртуальное поле для проверки полной верификации
userSchema.virtual('isFullyVerified').get(function() {
  return this.isEmailVerified;
});

// Хеширование пароля перед сохранением
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Метод для увеличения счетчика попыток входа
userSchema.methods.incLoginAttempts = function() {
  // Если есть предыдущая блокировка и она истекла
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        loginAttempts: 1,
        lockUntil: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Блокировка после 5 неудачных попыток на 2 часа
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 часа
    };
  }
  
  return this.updateOne(updates);
};

// Метод для сброса попыток входа
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    },
    $set: {
      lastLogin: new Date()
    }
  });
};

// Метод для предоставления доступа к студенческому дашборду
userSchema.methods.grantStudentAccess = function(adminId) {
  return this.updateOne({
    $set: {
      hasStudentAccess: true,
      accessGrantedBy: adminId,
      accessGrantedAt: new Date()
    }
  });
};

// Метод для отзыва доступа к студенческому дашборду
userSchema.methods.revokeStudentAccess = function() {
  return this.updateOne({
    $set: {
      hasStudentAccess: false
    },
    $unset: {
      accessGrantedBy: 1,
      accessGrantedAt: 1
    }
  });
};

// Индексы для оптимизации запросов
userSchema.index({ email: 1 });
userSchema.index({ whatsappNumber: 1 });
userSchema.index({ role: 1 });
userSchema.index({ hasStudentAccess: 1 });
userSchema.index({ isSchoolStudent: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

module.exports = mongoose.model('User', userSchema);