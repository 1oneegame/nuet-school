const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

// Конфигурация
const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-for-development';

console.log('🔑 Используемый JWT_SECRET:', JWT_SECRET ? 'Установлен' : 'Не найден');

// Данные тестового пользователя
const testStudent = {
  userId: '507f1f77bcf86cd799439011',
  email: 'student1@test.com',
  role: 'Student',
  hasStudentAccess: true
};

// Функция для создания JWT токена
function createToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Функция для тестирования API endpoint
async function testEndpoint(description, url, headers = {}) {
  console.log(`\n🧪 Тест: ${description}`);
  console.log(`📍 URL: ${url}`);
  
  try {
    const response = await axios.get(url, { headers });
    console.log(`✅ Статус: ${response.status}`);
    console.log(`📄 Ответ:`, JSON.stringify(response.data, null, 2));
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    if (error.response) {
      console.log(`❌ Статус: ${error.response.status}`);
      console.log(`📄 Ошибка:`, JSON.stringify(error.response.data, null, 2));
      return { success: false, status: error.response.status, data: error.response.data };
    } else {
      console.log(`💥 Ошибка сети:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('🚀 Запуск тестов доступа к студенческому дашборду');
  console.log('=' .repeat(60));

  const testUrl = `${BASE_URL}/api/test/student-access`;
  
  // Тест 1: Запрос без токена (должен вернуть 401)
  const test1 = await testEndpoint(
    'Доступ без токена авторизации',
    testUrl
  );
  
  // Тест 2: Запрос с недействительным токеном (должен вернуть 401)
  const test2 = await testEndpoint(
    'Доступ с недействительным токеном',
    testUrl,
    { 'Authorization': 'Bearer invalid-token-here' }
  );
  
  // Тест 3: Запрос с истекшим токеном (должен вернуть 401)
  const expiredToken = createToken(testStudent, '-1h'); // Токен истек час назад
  const test3 = await testEndpoint(
    'Доступ с истекшим токеном',
    testUrl,
    { 'Authorization': `Bearer ${expiredToken}` }
  );
  
  // Тест 4: Запрос с валидным токеном тестового студента (должен вернуть 200)
  const validToken = createToken(testStudent);
  const test4 = await testEndpoint(
    'Доступ с валидным токеном студента',
    testUrl,
    { 'Authorization': `Bearer ${validToken}` }
  );
  
  // Тест 5: Запрос с токеном пользователя без доступа к дашборду (должен вернуть 403)
  const userWithoutAccess = {
    userId: '507f1f77bcf86cd799439999',
    email: 'noacccess@test.com',
    role: 'User',
    hasStudentAccess: false
  };
  const noAccessToken = createToken(userWithoutAccess);
  const test5 = await testEndpoint(
    'Доступ с токеном пользователя без прав',
    testUrl,
    { 'Authorization': `Bearer ${noAccessToken}` }
  );

  // Сводка результатов
  console.log('\n' + '=' .repeat(60));
  console.log('📊 СВОДКА РЕЗУЛЬТАТОВ ТЕСТИРОВАНИЯ');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Без токена', result: test1, expected: 401 },
    { name: 'Недействительный токен', result: test2, expected: 401 },
    { name: 'Истекший токен', result: test3, expected: 401 },
    { name: 'Валидный токен студента', result: test4, expected: 200 },
    { name: 'Токен без прав доступа', result: test5, expected: 403 }
  ];
  
  let passedTests = 0;
  
  tests.forEach((test, index) => {
    const status = test.result.status || 'ERROR';
    const passed = status === test.expected;
    const icon = passed ? '✅' : '❌';
    
    console.log(`${icon} Тест ${index + 1}: ${test.name}`);
    console.log(`   Ожидался статус: ${test.expected}, получен: ${status}`);
    
    if (passed) passedTests++;
  });
  
  console.log('\n' + '-'.repeat(40));
  console.log(`🎯 Пройдено тестов: ${passedTests}/${tests.length}`);
  
  if (passedTests === tests.length) {
    console.log('🎉 Все тесты пройдены успешно! Защита дашборда работает корректно.');
  } else {
    console.log('⚠️  Некоторые тесты не пройдены. Проверьте конфигурацию защиты.');
  }
}

// Запуск тестов
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint, createToken };