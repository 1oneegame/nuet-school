const mongoose = require('mongoose');
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

// Схема пользователя (упрощенная)
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  whatsappNumber: String,
  role: String,
  hasStudentAccess: Boolean,
  isEmailVerified: Boolean,
  isWhatsappVerified: Boolean,
  isActive: Boolean,
  createdAt: Date
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

const checkUsers = async () => {
  try {
    await connectDB();
    
    console.log('\n🔍 Проверка пользователей в базе данных...');
    
    // Получаем всех пользователей
    const users = await User.find({}).select('email firstName lastName role hasStudentAccess isEmailVerified isWhatsappVerified isActive createdAt').lean();
    
    console.log(`\n📊 Всего пользователей в базе: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ Пользователи не найдены в базе данных');
      return;
    }
    
    console.log('\n👥 Список всех пользователей:');
    console.log('=' .repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Имя: ${user.firstName} ${user.lastName}`);
      console.log(`   Роль: ${user.role}`);
      console.log(`   Доступ к дашборду: ${user.hasStudentAccess ? '✅ Да' : '❌ Нет'}`);
      console.log(`   Email верифицирован: ${user.isEmailVerified ? '✅ Да' : '❌ Нет'}`);
      console.log(`   WhatsApp верифицирован: ${user.isWhatsappVerified ? '✅ Да' : '❌ Нет'}`);
      console.log(`   Активен: ${user.isActive ? '✅ Да' : '❌ Нет'}`);
      console.log(`   Создан: ${user.createdAt}`);
      console.log('-'.repeat(80));
    });
    
    // Статистика
    const stats = {
      total: users.length,
      withAccess: users.filter(u => u.hasStudentAccess).length,
      verified: users.filter(u => u.isEmailVerified && u.isWhatsappVerified).length,
      active: users.filter(u => u.isActive).length,
      admins: users.filter(u => u.role === 'Admin').length,
      students: users.filter(u => u.role === 'Student').length
    };
    
    console.log('\n📈 Статистика:');
    console.log(`Всего пользователей: ${stats.total}`);
    console.log(`С доступом к дашборду: ${stats.withAccess}`);
    console.log(`Полностью верифицированных: ${stats.verified}`);
    console.log(`Активных: ${stats.active}`);
    console.log(`Администраторов: ${stats.admins}`);
    console.log(`Студентов: ${stats.students}`);
    
  } catch (error) {
    console.error('❌ Ошибка при проверке пользователей:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Соединение с базой данных закрыто');
  }
};

checkUsers();