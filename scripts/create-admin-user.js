const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Подключение к базе данных
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Подключение к MongoDB установлено');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Схема пользователя (упрощенная)
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  whatsappNumber: String,
  role: String,
  hasStudentAccess: Boolean,
  isSchoolStudent: Boolean,
  isEmailVerified: Boolean,
  isWhatsappVerified: Boolean,
  isActive: Boolean,
  loginAttempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

const createAdminUser = async () => {
  try {
    await connectDB();
    
    // Проверяем, есть ли уже админ
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    
    if (existingAdmin) {
      console.log('👤 Админ-пользователь уже существует:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Роль: ${existingAdmin.role}`);
      console.log(`   Создан: ${existingAdmin.createdAt}`);
      return;
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Создаем админ-пользователя
    const adminUser = new User({
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Администратор',
      lastName: 'Системы',
      whatsappNumber: '+77771234560',
      role: 'admin',
      hasStudentAccess: false,
      isSchoolStudent: false,
      isEmailVerified: true,
      isWhatsappVerified: true,
      isActive: true,
      loginAttempts: 0
    });
    
    await adminUser.save();
    
    console.log('✅ Админ-пользователь успешно создан!');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Пароль: admin123');
    console.log('👤 Роль: admin');
    
  } catch (error) {
    console.error('❌ Ошибка создания админ-пользователя:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Соединение с базой данных закрыто');
  }
};

createAdminUser();