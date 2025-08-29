const https = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

// Создаем тестовый JWT токен для администратора
const createAdminToken = () => {
  const payload = {
    userId: '507f1f77bcf86cd799439011', // Фиктивный ID администратора
    email: 'admin@test.com',
    role: 'admin'
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const testAdminAPI = async () => {
  try {
    console.log('🔍 Тестирование API endpoint /api/admin/users...');
    
    const token = createAdminToken();
    console.log('✅ JWT токен создан');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/users',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`📊 Статус ответа: ${res.statusCode}`);
      console.log(`📋 Заголовки:`, res.headers);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('\n📄 Ответ API:');
          console.log(JSON.stringify(response, null, 2));
          
          if (response.users) {
            console.log(`\n👥 Найдено пользователей: ${response.users.length}`);
            response.users.forEach((user, index) => {
              console.log(`${index + 1}. ${user.email} (${user.role}) - Доступ: ${user.hasStudentAccess ? 'Да' : 'Нет'}`);
            });
          }
        } catch (error) {
          console.log('\n📄 Сырой ответ:');
          console.log(data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Ошибка запроса:', error);
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
};

testAdminAPI();