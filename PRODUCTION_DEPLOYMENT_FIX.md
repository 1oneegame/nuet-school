# Исправление ошибки "Unexpected end of JSON input" на продакшене

## Проблема
На деплое возникает ошибка `Failed to execute 'json' on 'Response': Unexpected end of JSON input` при попытке входа.

## Причины ошибки
1. **Отсутствие переменных окружения** - `JWT_SECRET` или `MONGODB_URI`
2. **Проблемы с подключением к MongoDB Atlas**
3. **Неправильная обработка ошибок в API**
4. **Превышение timeout подключения к базе данных**

## Исправления

### 1. Переменные окружения
Убедитесь, что в Vercel настроены все необходимые переменные:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nuet-app?retryWrites=true&w=majority
JWT_SECRET=ваш-секретный-ключ-64-символа
NEXTAUTH_SECRET=ваш-nextauth-секрет
NEXTAUTH_URL=https://ваш-домен.vercel.app
NODE_ENV=production
```

**Генерация безопасных секретов:**
```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# NEXTAUTH_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. MongoDB Atlas настройка
1. **Network Access**: Добавьте `0.0.0.0/0` для доступа отовсюду
2. **Database User**: Создайте пользователя с правами `readWrite`
3. **Connection String**: Используйте строку подключения с правильным паролем

### 3. Проверка подключения
Добавьте тестовый API endpoint для проверки:

```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../backend/lib/dbConnect';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    res.status(200).json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    });
  }
}
```

### 4. Отладка в продакшене

**Проверьте логи Vercel:**
1. Зайдите в Vercel Dashboard
2. Откройте ваш проект
3. Перейдите в Functions → View Function Logs
4. Попробуйте войти и посмотрите ошибки

**Включите подробные логи:**
```typescript
// В начале API handlers
console.log('Environment check:', {
  hasMongoUri: !!process.env.MONGODB_URI,
  hasJwtSecret: !!process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV
});
```

### 5. Временное решение для отладки

Добавьте в `/api/auth/login.ts` дополнительную отладку:

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Принудительно устанавливаем Content-Type
  res.setHeader('Content-Type', 'application/json');
  
  // Логируем все входящие данные
  console.log('Login attempt:', {
    method: req.method,
    hasBody: !!req.body,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    env: {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
    }
  });
  
  try {
    // Ваш код...
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Всегда возвращаем JSON
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

### 6. Пошаговая диагностика

1. **Проверьте переменные окружения:**
   ```bash
   # Через Vercel CLI
   vercel env ls
   ```

2. **Проверьте health endpoint:**
   ```bash
   curl https://ваш-домен.vercel.app/api/health
   ```

3. **Проверьте логи при входе:**
   - Откройте DevTools → Network
   - Попробуйте войти
   - Посмотрите что возвращает `/api/auth/login`

4. **Проверьте MongoDB подключение:**
   - Зайдите в MongoDB Atlas
   - Проверьте Recent Activity
   - Убедитесь что подключения проходят

### 7. Дополнительные настройки vercel.json

```json
{
  "functions": {
    "src/pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "JWT_SECRET": "@jwt-secret"  
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ]
    }
  ]
}
```

### 8. Если ничего не помогает

1. **Проверьте регион деплоя** - возможно проблема с подключением к MongoDB из определенного региона
2. **Временно включите все логи** в production
3. **Создайте минимальный API endpoint** без MongoDB для проверки
4. **Проверьте совместимость версий** Next.js и зависимостей

## Контрольный список

- [ ] Все переменные окружения настроены в Vercel
- [ ] MongoDB Atlas доступен из любого IP (0.0.0.0/0)
- [ ] Пользователь MongoDB имеет права readWrite  
- [ ] Connection string корректен и пароль экранирован
- [ ] JWT_SECRET и NEXTAUTH_SECRET сгенерированы заново для production
- [ ] API возвращает правильные Content-Type заголовки
- [ ] Обработка ошибок корректна
- [ ] Логи показывают детали ошибки

После выполнения всех пунктов ошибка должна исчезнуть.
