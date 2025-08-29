# Приложение для подготовки к НУЕТ и критическому мышлению

## Описание проекта

Полноценное, адаптивное web-приложение для персональной подготовки к НУЕТ и критическому мышлению. Включает лендинг, 4 основные страницы и админ-панель. Продукт полностью управляется через админ-панель без участия разработчика.

## Структура проекта

### Фронтенд (Next.js + React + TypeScript + Tailwind CSS)

```
src/
  ├── components/
  │   ├── admin/         # Компоненты админ-панели
  │   ├── auth/          # Компоненты авторизации
  │   ├── common/        # Общие компоненты (Header, Footer, etc)
  │   ├── course/        # Компоненты для страницы курса
  │   ├── critical/      # Компоненты для страницы критического мышления
  │   ├── exam/          # Компоненты для страницы экзаменов
  │   ├── landing/       # Компоненты лендинга
  │   └── resources/     # Компоненты для страницы ресурсов
  ├── context/           # React контексты (Auth, Theme, etc)
  ├── hooks/             # Кастомные хуки
  ├── layouts/           # Шаблоны страниц
  ├── pages/             # Страницы приложения
  │   ├── admin/         # Админ-панель
  │   ├── api/           # API роуты Next.js
  │   ├── auth/          # Страницы авторизации
  │   ├── course/        # Страница видеокурса
  │   ├── critical/      # Страница критического мышления
  │   ├── exam/          # Страница НУЕТ тренировки
  │   ├── resources/     # Страница полезных ресурсов
  │   ├── _app.tsx       # Корневой компонент
  │   └── index.tsx      # Лендинг
  ├── styles/            # Глобальные стили
  ├── types/             # TypeScript типы
  └── utils/             # Утилиты и хелперы
```

### Бэкенд (Node.js + Express + MongoDB)

```
backend/
  ├── config/            # Конфигурация приложения
  ├── controllers/       # Контроллеры API
  ├── middleware/        # Middleware функции
  ├── models/            # Mongoose модели
  ├── routes/            # API маршруты
  ├── services/          # Бизнес-логика
  ├── utils/             # Утилиты и хелперы
  └── server.js          # Точка входа
```

## Основные страницы

### 1. Лендинг (/)

Цель: конвертировать в регистрацию/вход или запуск демо-мока.

**Блоки (все редактируемые из админки):**
- Hero секция с заголовком, подзаголовком и кнопками
- "Как это работает" - 3 шага с иконками
- Фичи - карточки 4 страниц (Course / Exam / Critical / Resources)
- Результаты/Отчёты - макет графика прогресса
- Отзывы (опционально)
- FAQ
- Footer с политикой/контактами/соцсетями

### 2. Видеокурс (/course)

- Слева: дерево тем (Topic) с прогресс-индикатором
- Справа (контент темы):
  - Секция "Уроки": карточки Lesson (название, длительность, статус)
  - Плеер с сохранением позиции просмотра
  - PDF Теория со встроенным просмотром
  - Домашка с отметкой выполнения
  - Revision-мини-тест с мгновенной проверкой
  - Прогресс по теме

### 3. НУЕТ Тренировка (/exam)

- Переключатель режимов: Exam Mode / Training Mode
- Exam Mode:
  - Выбор экзамена
  - Таймер, навигация по вопросам, флаг "вернуться позже"
  - После сдачи: итоговый балл, разбивка по темам, список ошибок
- Training Mode:
  - Поток вопросов без общего таймера
  - После ответа: Правильно/Неправильно, Hint, Видеоразбор

### 4. Critical Thinking (/critical)

- Фильтры: Экзамен (TSA/BMAT/IMAT) → Категория → Подкатегория → Сложность
- Тренировочные наборы или запуск "тренировки по фильтру"
- Процесс решения с мгновенной обратной связью
- Статистика по категориям

### 5. Полезные ресурсы (/resources)

- Сетка карточек с title, description, тип, теги, кнопка "Открыть"
- Типы: gdrive, pdf, link, video (с иконками)
- Поиск/фильтр по типу/тегам

### 6. Админ-панель (/admin)

- Dashboard: пользователи, активность, % завершения тем
- Контент: управление курсами, темами, уроками
- Вопросы/Тесты: создание и импорт
- Категории CT: управление категориями и подкатегориями
- Ресурсы: управление карточками ресурсов
- Пользователи: управление пользователями
- Настройки сайта: бренд, тексты, SEO
- Экспорт/Импорт: выгрузка результатов, бэкап контента

## Технологический стек

### Фронтенд
- Next.js (React framework)
- TypeScript
- Tailwind CSS
- React Context API для управления состоянием
- NextAuth.js для аутентификации
- React Player для видеоплеера
- Chart.js для визуализации данных

### Бэкенд
- Node.js с Express
- MongoDB с Mongoose
- JWT для авторизации
- Multer для загрузки файлов
- Nodemailer для отправки email

### Инфраструктура
- Vercel для деплоя фронтенда
- MongoDB Atlas для базы данных
- AWS S3 или аналог для хранения файлов

## Модели данных

### User (Пользователь)
- _id: ObjectId
- email: String
- password: String (хешированный)
- name: String
- role: String (user, admin)
- createdAt: Date
- lastLogin: Date

### Topic (Тема)
- _id: ObjectId
- title: String
- description: String
- order: Number
- lessons: [Lesson]
- revisionQuiz: Quiz (опционально)

### Lesson (Урок)
- _id: ObjectId
- title: String
- description: String
- videoUrl: String
- duration: Number
- order: Number
- pdfTheoryUrls: [String]
- homework: String

### Quiz (Тест)
- _id: ObjectId
- title: String
- description: String
- type: String (exam, revision, training)
- timeLimit: Number (в минутах)
- questions: [Question]
- shuffleQuestions: Boolean

### Question (Вопрос)
- _id: ObjectId
- stem: String (HTML)
- options: [String]
- correctAnswer: String/Number
- explanation: String
- hint: String
- videoExplanation: String (URL)
- topics: [ObjectId] (связь с Topic)
- ctCategories: [ObjectId] (связь с CTCategory)

### CTCategory (Категория критического мышления)
- _id: ObjectId
- name: String
- description: String
- examType: String (TSA, BMAT, IMAT)
- subcategories: [CTSubcategory]

### CTSubcategory (Подкатегория критического мышления)
- _id: ObjectId
- name: String
- description: String

### Resource (Ресурс)
- _id: ObjectId
- title: String
- description: String
- type: String (gdrive, pdf, link, video)
- url: String
- tags: [String]
- order: Number
- isVisible: Boolean

### UserProgress (Прогресс пользователя)
- _id: ObjectId
- userId: ObjectId
- topicId: ObjectId
- lessonProgress: [
  {
    lessonId: ObjectId,
    watched: Boolean,
    watchedPercentage: Number,
    lastPosition: Number
  }
]
- homeworkCompleted: Boolean
- quizResults: [
  {
    quizId: ObjectId,
    score: Number,
    completedAt: Date,
    answers: [
      {
        questionId: ObjectId,
        userAnswer: String/Number,
        isCorrect: Boolean
      }
    ]
  }
]

### SiteSettings (Настройки сайта)
- _id: ObjectId
- brandName: String
- logo: String (URL)
- colors: Object
- landingTexts: Object
- seoSettings: Object
- features: Object (включение/выключение функций)

## Функциональность админ-панели

1. **Управление контентом**
   - CRUD операции для Topic, Lesson, Quiz, Question
   - Drag-and-drop для изменения порядка
   - Загрузка видео и PDF файлов
   - Привязка revision-квизов к темам

2. **Управление тестами**
   - Создание и редактирование Quiz
   - Импорт вопросов из CSV/Excel/JSON
   - Редактор вопросов с поддержкой HTML
   - Управление категориями CT

3. **Управление ресурсами**
   - CRUD операции для Resource
   - Управление видимостью и порядком

4. **Управление пользователями**
   - Просмотр списка пользователей
   - Сброс пароля
   - Изменение роли
   - Блокировка пользователей

5. **Настройки сайта**
   - Изменение бренда/логотипа/цветов
   - Редактирование текстов лендинга
   - Настройка SEO
   - Включение/выключение режимов

6. **Аналитика**
   - Просмотр активности пользователей
   - Статистика по темам и тестам
   - Экспорт результатов

## Требования к UI

- Чистый, минималистичный, контрастный дизайн
- Адаптивность для всех устройств
- Редактируемые цвета/лого/тексты через админку
- Валидация форм
- Предпросмотр изменений
- Возможность отката изменений (draft/publish)