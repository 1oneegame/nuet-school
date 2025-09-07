const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Импортируем модель пользователя
let User;
try {
  User = require('./src/backend/models/User');
} catch (error) {
  console.log('Используем упрощенную модель пользователя...');
  
  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    whatsappNumber: String,
    role: { type: String, default: 'User' },
    hasStudentAccess: { type: Boolean, default: false },
    isSchoolStudent: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isWhatsappVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    loginAttempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }, { collection: 'users' });
  
  User = mongoose.model('User', userSchema);
}

// Подключение к MongoDB с несколькими вариантами URI
const connectToMongoDB = async () => {
  const possibleURIs = [
    process.env.MONGODB_URI,
    'mongodb://localhost:27017/nuet-app',
    'mongodb://127.0.0.1:27017/nuet-app',
    'mongodb://localhost:27017/240school',
    'mongodb://127.0.0.1:27017/240school'
  ];

  for (const uri of possibleURIs) {
    if (!uri) continue;
    
    try {
      console.log(`Пробуем подключиться к: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Подключение к MongoDB успешно!');
      return true;
    } catch (error) {
      console.log(`❌ Не удалось подключиться к ${uri}: ${error.message}`);
    }
  }
  
  throw new Error('Не удалось подключиться ни к одной базе данных');
};

async function createTestUsers() {
  try {
    await connectToMongoDB();

    // Хешируем пароли
    const studentPassword = await bcrypt.hash('student123', 12);
    const adminPassword = await bcrypt.hash('admin123', 12);
    const noAccessPassword = await bcrypt.hash('noaccess123', 12);

    // Создаем тестовых пользователей
    const testUsers = [
      // Тестовые студенты
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        email: 'student1@test.com',
        password: studentPassword,
        whatsappNumber: '+77771234567',
        firstName: 'Айдар',
        lastName: 'Тестов',
        role: 'Student',
        hasStudentAccess: true,
        isSchoolStudent: true,
        isEmailVerified: true,
        isWhatsappVerified: true,
        isActive: true
      },
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        email: 'student2@test.com',
        password: studentPassword,
        whatsappNumber: '+77771234568',
        firstName: 'Амина',
        lastName: 'Студентова',
        role: 'Student',
        hasStudentAccess: true,
        isSchoolStudent: true,
        isEmailVerified: true,
        isWhatsappVerified: true,
        isActive: true
      },
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
        email: 'student3@test.com',
        password: studentPassword,
        whatsappNumber: '+77771234569',
        firstName: 'Данияр',
        lastName: 'Ученикович',
        role: 'Student',
        hasStudentAccess: true,
        isSchoolStudent: true,
        isEmailVerified: true,
        isWhatsappVerified: true,
        isActive: true
      },
      // Админ
      {
        email: 'admin@test.com',
        password: adminPassword,
        whatsappNumber: '+77771234560',
        firstName: 'Администратор',
        lastName: 'Системы',
        role: 'admin',
        hasStudentAccess: false,
        isSchoolStudent: false,
        isEmailVerified: true,
        isWhatsappVerified: true,
        isActive: true
      },
      // Пользователь без доступа
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439999'),
        email: 'noaccess@test.com',
        password: noAccessPassword,
        whatsappNumber: '+77771234999',
        firstName: 'Без',
        lastName: 'Доступа',
        role: 'User',
        hasStudentAccess: false,
        isSchoolStudent: false,
        isEmailVerified: true,
        isWhatsappVerified: true,
        isActive: true
      }
    ];

    // Удаляем существующих тестовых пользователей
    const emailsToDelete = testUsers.map(user => user.email);
    await User.deleteMany({ email: { $in: emailsToDelete } });
    console.log('🗑️ Удалены существующие тестовые пользователи');

    // Создаем новых пользователей
    const createdUsers = await User.insertMany(testUsers);
    
    console.log('\n✅ Созданы тестовые пользователи:');
    console.log('='.repeat(50));
    
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   WhatsApp: ${user.whatsappNumber}`);
      console.log(`   Роль: ${user.role}`);
      console.log(`   Доступ к дашборду: ${user.hasStudentAccess ? '✅ Да' : '❌ Нет'}`);
      console.log('   ---');
    });

    console.log('\n📝 Пароли для входа:');
    console.log('Студенты: student123');
    console.log('Админ: admin123');
    console.log('Без доступа: noaccess123');
    console.log('\n🎉 Все пользователи успешно созданы!');
    
  } catch (error) {
    console.error('❌ Ошибка при создании пользователей:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Соединение с базой данных закрыто');
  }
}

createTestUsers();
