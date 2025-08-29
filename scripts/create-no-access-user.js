const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Подключение к MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Подключение к MongoDB успешно');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Импорт модели User
const User = require('../backend/models/User');

const createNoAccessUser = async () => {
  try {
    await connectDB();

    // Удаляем существующего пользователя без доступа
    await User.deleteOne({ email: 'noaccess@test.com' });
    console.log('🗑️ Удален существующий пользователь без доступа');

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('noaccess123', 12);

    // Создаем пользователя без доступа к дашборду
    const noAccessUser = {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439999'),
      email: 'noaccess@test.com',
      password: hashedPassword,
      whatsappNumber: '+77771234999',
      firstName: 'Без',
      lastName: 'Доступа',
      role: 'User',
      hasStudentAccess: false, // Нет доступа к дашборду
      isSchoolStudent: false,
      isEmailVerified: true,
      isWhatsappVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await User.create(noAccessUser);

    console.log('✅ Создан пользователь без доступа к дашборду:');
    console.log('   Email: noaccess@test.com');
    console.log('   WhatsApp: +77771234999');
    console.log('   ID: 507f1f77bcf86cd799439999');
    console.log('   Роль: User');
    console.log('   Доступ к дашборду: false');
    console.log('   Пароль: noaccess123');

  } catch (error) {
    console.error('❌ Ошибка при создании пользователя:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Соединение с базой данных закрыто');
  }
};

// Запуск скрипта
if (require.main === module) {
  createNoAccessUser();
}

module.exports = createNoAccessUser;