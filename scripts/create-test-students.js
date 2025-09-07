const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../backend/models/User');
require('dotenv').config({ path: '../.env' });

// Подключение к MongoDB
const MONGODB_URI = process.env.MONGODB_URI

async function createTestStudents() {
  try {
    // Подключение к базе данных
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
    });
    
    console.log('✅ Подключение к MongoDB успешно');

    // Хешируем пароль для всех тестовых пользователей
    const hashedPassword = await bcrypt.hash('student123', 12);

    // Создаем трех тестовых пользователей-студентов
    const testStudents = [
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Уникальный ID для тестирования
        email: 'student1@test.com',
        password: hashedPassword,
        whatsappNumber: '+77771234567',
        firstName: 'Айдар',
        lastName: 'Тестов',
        role: 'Student',
        hasStudentAccess: true,
        isSchoolStudent: true,
        isEmailVerified: true,
        isWhatsappVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), // Уникальный ID для тестирования
        email: 'student2@test.com',
        password: hashedPassword,
        whatsappNumber: '+77771234568',
        firstName: 'Амина',
        lastName: 'Студентова',
        role: 'Student',
        hasStudentAccess: true,
        isSchoolStudent: true,
        isEmailVerified: true,
        isWhatsappVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'), // Уникальный ID для тестирования
        email: 'student3@test.com',
        password: hashedPassword,
        whatsappNumber: '+77771234569',
        firstName: 'Данияр',
        lastName: 'Ученикович',
        role: 'Student',
        hasStudentAccess: true,
        isSchoolStudent: true,
        isEmailVerified: true,
        isWhatsappVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Удаляем существующих тестовых пользователей (если есть)
    await User.deleteMany({ 
      email: { 
        $in: ['student1@test.com', 'student2@test.com', 'student3@test.com'] 
      } 
    });
    
    console.log('🗑️ Удалены существующие тестовые пользователи');

    // Создаем новых тестовых пользователей
    const createdStudents = await User.insertMany(testStudents);
    
    console.log('✅ Созданы тестовые пользователи-студенты:');
    createdStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   WhatsApp: ${student.whatsappNumber}`);
      console.log(`   ID: ${student._id}`);
      console.log(`   Роль: ${student.role}`);
      console.log(`   Доступ к дашборду: ${student.hasStudentAccess}`);
      console.log('   ---');
    });

    console.log('\n📝 Данные для входа:');
    console.log('Пароль для всех тестовых пользователей: student123');
    
  } catch (error) {
    console.error('❌ Ошибка при создании тестовых пользователей:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Соединение с базой данных закрыто');
  }
}

// Запуск скрипта
if (require.main === module) {
  createTestStudents();
}

module.exports = createTestStudents;