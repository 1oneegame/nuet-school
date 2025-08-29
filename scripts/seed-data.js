const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Определение схем напрямую в скрипте
const { Schema } = mongoose;

// Схема урока
const LessonSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  duration: { type: String, required: true, trim: true },
  videoUrl: { type: String, trim: true },
  theoryPdf: { type: String, trim: true },
  homeworkPdf: { type: String, trim: true },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Схема модуля
const ModuleSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true },
  lessons: [LessonSchema],
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Схема видео
const VideoSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  duration: { type: Number, required: true },
  order: { type: Number, default: 0 }
});

// Схема темы
const TopicSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true },
  videos: [VideoSchema],
  order: { type: Number, default: 0 }
});

// Схема курса
const CourseSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: true, trim: true },
  topics: [TopicSchema]
}, { timestamps: true });

// Схема ресурса
const ResourceSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: true, trim: true },
  type: { type: String, enum: ['book', 'article', 'video', 'website', 'tool', 'other'], required: true },
  tags: [{ type: String, trim: true }]
}, { timestamps: true });

// Схема ответа
const AnswerSchema = new Schema({
  text: { type: String, required: true, trim: true },
  isCorrect: { type: Boolean, required: true, default: false }
});

// Схема вопроса
const QuestionSchema = new Schema({
  text: { type: String, required: true, trim: true },
  answers: [AnswerSchema],
  explanation: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
}, { timestamps: true });

// Схема экзамена
const ExamSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  timeLimit: { type: Number, required: true },
  passingScore: { type: Number, required: true }
}, { timestamps: true });

// Схема задания критического мышления
const CriticalTaskSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  tags: [{ type: String, trim: true }],
  sampleAnswer: { type: String, required: true, trim: true }
}, { timestamps: true });

// Создание моделей
const Module = mongoose.model('Module', ModuleSchema);
const Course = mongoose.model('Course', CourseSchema);
const Resource = mongoose.model('Resource', ResourceSchema);
const Question = mongoose.model('Question', QuestionSchema);
const Exam = mongoose.model('Exam', ExamSchema);
const CriticalTask = mongoose.model('CriticalTask', CriticalTaskSchema);

// Подключение к базе данных
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuet-app';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Подключение к MongoDB успешно');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
}

// Тестовые данные для модулей
const sampleModules = [
  {
    title: 'Основы НУЕТ',
    description: 'Основы подготовки к Национальному единому тестированию',
    order: 1,
    lessons: [
      {
        title: 'Введение в НУЕТ',
        duration: '15 мин',
        videoUrl: '/videos/lesson-1.mp4',
        theoryPdf: '/materials/lesson-1-theory.pdf',
        homeworkPdf: '/materials/lesson-1-homework.pdf',
        completed: false,
        order: 1
      },
      {
        title: 'Структура экзамена',
        duration: '20 мин',
        videoUrl: '/videos/lesson-2.mp4',
        theoryPdf: '/materials/lesson-2-theory.pdf',
        homeworkPdf: '/materials/lesson-2-homework.pdf',
        completed: false,
        order: 2
      },
      {
        title: 'Стратегии решения',
        duration: '25 мин',
        videoUrl: '/videos/lesson-3.mp4',
        theoryPdf: '/materials/lesson-3-theory.pdf',
        homeworkPdf: '/materials/lesson-3-homework.pdf',
        completed: false,
        order: 3
      }
    ]
  },
  {
    title: 'Математика',
    description: 'Подготовка по математике для НУЕТ',
    order: 2,
    lessons: [
      {
        title: 'Ratio, proportions, percent',
        duration: '30 мин',
        videoUrl: '/videos/math-1.mp4',
        theoryPdf: '/materials/math-1-theory.pdf',
        homeworkPdf: '/materials/math-1-homework.pdf',
        completed: false,
        order: 1
      },
      {
        title: 'Expressions',
        duration: '25 мин',
        videoUrl: '/videos/math-2.mp4',
        theoryPdf: '/materials/math-2-theory.pdf',
        homeworkPdf: '/materials/math-2-homework.pdf',
        completed: false,
        order: 2
      },
      {
        title: 'Equations and Systems',
        duration: '35 мин',
        videoUrl: '/videos/math-3.mp4',
        theoryPdf: '/materials/math-3-theory.pdf',
        homeworkPdf: '/materials/math-3-homework.pdf',
        completed: false,
        order: 3
      },
      {
        title: 'Inequalities',
        duration: '30 мин',
        videoUrl: '/videos/math-4.mp4',
        theoryPdf: '/materials/math-4-theory.pdf',
        homeworkPdf: '/materials/math-4-homework.pdf',
        completed: false,
        order: 4
      },
      {
        title: 'Sequences',
        duration: '25 мин',
        videoUrl: '/videos/math-5.mp4',
        theoryPdf: '/materials/math-5-theory.pdf',
        homeworkPdf: '/materials/math-5-homework.pdf',
        completed: false,
        order: 5
      },
      {
        title: 'Lines',
        duration: '20 мин',
        videoUrl: '/videos/math-6.mp4',
        theoryPdf: '/materials/math-6-theory.pdf',
        homeworkPdf: '/materials/math-6-homework.pdf',
        completed: false,
        order: 6
      },
      {
        title: 'Quadratics and Lines',
        duration: '35 мин',
        videoUrl: '/videos/math-7.mp4',
        theoryPdf: '/materials/math-7-theory.pdf',
        homeworkPdf: '/materials/math-7-homework.pdf',
        completed: false,
        order: 7
      },
      {
        title: 'Triangles and Trigonometry',
        duration: '40 мин',
        videoUrl: '/videos/math-8.mp4',
        theoryPdf: '/materials/math-8-theory.pdf',
        homeworkPdf: '/materials/math-8-homework.pdf',
        completed: false,
        order: 8
      },
      {
        title: 'Circles',
        duration: '30 мин',
        videoUrl: '/videos/math-9.mp4',
        theoryPdf: '/materials/math-9-theory.pdf',
        homeworkPdf: '/materials/math-9-homework.pdf',
        completed: false,
        order: 9
      },
      {
        title: 'Regular Polygons',
        duration: '25 мин',
        videoUrl: '/videos/math-10.mp4',
        theoryPdf: '/materials/math-10-theory.pdf',
        homeworkPdf: '/materials/math-10-homework.pdf',
        completed: false,
        order: 10
      },
      {
        title: 'Quadrilaterals',
        duration: '30 мин',
        videoUrl: '/videos/math-11.mp4',
        theoryPdf: '/materials/math-11-theory.pdf',
        homeworkPdf: '/materials/math-11-homework.pdf',
        completed: false,
        order: 11
      },
      {
        title: 'Bearing',
        duration: '25 мин',
        videoUrl: '/videos/math-12.mp4',
        theoryPdf: '/materials/math-12-theory.pdf',
        homeworkPdf: '/materials/math-12-homework.pdf',
        completed: false,
        order: 12
      },
      {
        title: 'Geometry 3D',
        duration: '35 мин',
        videoUrl: '/videos/math-13.mp4',
        theoryPdf: '/materials/math-13-theory.pdf',
        homeworkPdf: '/materials/math-13-homework.pdf',
        completed: false,
        order: 13
      }
    ]
  },
  {
    title: 'Критическое мышление',
    description: 'Развитие навыков критического мышления для НУЕТ',
    order: 3,
    lessons: [
      {
        title: 'Expression of Conclusion',
        duration: '25 мин',
        videoUrl: '/videos/critical-1.mp4',
        theoryPdf: '/materials/critical-1-theory.pdf',
        homeworkPdf: '/materials/critical-1-homework.pdf',
        completed: false,
        order: 1
      },
      {
        title: 'Drawing Conclusion',
        duration: '30 мин',
        videoUrl: '/videos/critical-2.mp4',
        theoryPdf: '/materials/critical-2-theory.pdf',
        homeworkPdf: '/materials/critical-2-homework.pdf',
        completed: false,
        order: 2
      },
      {
        title: 'Assumptions',
        duration: '25 мин',
        videoUrl: '/videos/critical-3.mp4',
        theoryPdf: '/materials/critical-3-theory.pdf',
        homeworkPdf: '/materials/critical-3-homework.pdf',
        completed: false,
        order: 3
      },
      {
        title: 'Flaws',
        duration: '30 мин',
        videoUrl: '/videos/critical-4.mp4',
        theoryPdf: '/materials/critical-4-theory.pdf',
        homeworkPdf: '/materials/critical-4-homework.pdf',
        completed: false,
        order: 4
      },
      {
        title: 'Weakening and strengthening practice',
        duration: '35 мин',
        videoUrl: '/videos/critical-5.mp4',
        theoryPdf: '/materials/critical-5-theory.pdf',
        homeworkPdf: '/materials/critical-5-homework.pdf',
        completed: false,
        order: 5
      },
      {
        title: 'Applying principle',
        duration: '30 мин',
        videoUrl: '/videos/critical-6.mp4',
        theoryPdf: '/materials/critical-6-theory.pdf',
        homeworkPdf: '/materials/critical-6-homework.pdf',
        completed: false,
        order: 6
      },
      {
        title: 'Parallel reasoning',
        duration: '25 мин',
        videoUrl: '/videos/critical-7.mp4',
        theoryPdf: '/materials/critical-7-theory.pdf',
        homeworkPdf: '/materials/critical-7-homework.pdf',
        completed: false,
        order: 7
      },
      {
        title: 'Probabilities and Combinations',
        duration: '40 мин',
        videoUrl: '/videos/critical-8.mp4',
        theoryPdf: '/materials/critical-8-theory.pdf',
        homeworkPdf: '/materials/critical-8-homework.pdf',
        completed: false,
        order: 8
      },
      {
        title: 'Mathematical Question',
        duration: '30 мин',
        videoUrl: '/videos/critical-9.mp4',
        theoryPdf: '/materials/critical-9-theory.pdf',
        homeworkPdf: '/materials/critical-9-homework.pdf',
        completed: false,
        order: 9
      },
      {
        title: 'Tabular Questions',
        duration: '25 мин',
        videoUrl: '/videos/critical-10.mp4',
        theoryPdf: '/materials/critical-10-theory.pdf',
        homeworkPdf: '/materials/critical-10-homework.pdf',
        completed: false,
        order: 10
      },
      {
        title: 'Spatial Questions',
        duration: '30 мин',
        videoUrl: '/videos/critical-11.mp4',
        theoryPdf: '/materials/critical-11-theory.pdf',
        homeworkPdf: '/materials/critical-11-homework.pdf',
        completed: false,
        order: 11
      },
      {
        title: 'SDT Questions',
        duration: '25 мин',
        videoUrl: '/videos/critical-12.mp4',
        theoryPdf: '/materials/critical-12-theory.pdf',
        homeworkPdf: '/materials/critical-12-homework.pdf',
        completed: false,
        order: 12
      },
      {
        title: 'Pin Code Questions',
        duration: '20 мин',
        videoUrl: '/videos/critical-13.mp4',
        theoryPdf: '/materials/critical-13-theory.pdf',
        homeworkPdf: '/materials/critical-13-homework.pdf',
        completed: false,
        order: 13
      },
      {
        title: 'Cube Questions',
        duration: '25 мин',
        videoUrl: '/videos/critical-14.mp4',
        theoryPdf: '/materials/critical-14-theory.pdf',
        homeworkPdf: '/materials/critical-14-homework.pdf',
        completed: false,
        order: 14
      },
      {
        title: 'Date & Time Questions',
        duration: '20 мин',
        videoUrl: '/videos/critical-15.mp4',
        theoryPdf: '/materials/critical-15-theory.pdf',
        homeworkPdf: '/materials/critical-15-homework.pdf',
        completed: false,
        order: 15
      }
    ]
  }
];

// Тестовые данные для курсов
const sampleCourses = [
  {
    title: 'Полный курс подготовки к NUET',
    description: 'Комплексная подготовка ко всем разделам Национального единого тестирования',
    imageUrl: '/images/course-main.jpg',
    topics: [
      {
        title: 'Математическая грамотность',
        description: 'Развитие навыков решения математических задач',
        order: 1,
        videos: [
          {
            title: 'Основы математической логики',
            description: 'Изучение основных принципов математического мышления',
            url: '/videos/math-logic.mp4',
            duration: 1800, // 30 минут
            order: 1
          },
          {
            title: 'Решение текстовых задач',
            description: 'Методы и подходы к решению практических задач',
            url: '/videos/text-problems.mp4',
            duration: 2400, // 40 минут
            order: 2
          }
        ]
      },
      {
        title: 'Читательская грамотность',
        description: 'Развитие навыков понимания и анализа текстов',
        order: 2,
        videos: [
          {
            title: 'Анализ художественных текстов',
            description: 'Методы анализа литературных произведений',
            url: '/videos/literature-analysis.mp4',
            duration: 2100, // 35 минут
            order: 1
          }
        ]
      }
    ]
  }
];

// Тестовые данные для ресурсов
const sampleResources = [
  {
    title: 'Официальный сайт NUET',
    description: 'Официальная информация о Национальном едином тестировании',
    url: 'https://nuet.kz',
    imageUrl: '/images/nuet-official.jpg',
    type: 'website',
    tags: ['официальный', 'информация', 'nuet']
  },
  {
    title: 'Сборник задач по математике',
    description: 'Комплексный сборник задач для подготовки к математической части NUET',
    url: '/resources/math-problems.pdf',
    imageUrl: '/images/math-book.jpg',
    type: 'book',
    tags: ['математика', 'задачи', 'подготовка']
  },
  {
    title: 'Видеоуроки по физике',
    description: 'Серия обучающих видео по основным темам физики',
    url: 'https://youtube.com/physics-nuet',
    imageUrl: '/images/physics-video.jpg',
    type: 'video',
    tags: ['физика', 'видео', 'уроки']
  }
];

// Тестовые данные для вопросов и экзаменов
const sampleQuestions = [
  {
    text: 'Чему равна сумма углов треугольника?',
    answers: [
      { text: '90°', isCorrect: false },
      { text: '180°', isCorrect: true },
      { text: '270°', isCorrect: false },
      { text: '360°', isCorrect: false }
    ],
    explanation: 'Сумма углов любого треугольника всегда равна 180 градусам.',
    category: 'Геометрия',
    difficulty: 'easy'
  },
  {
    text: 'Решите уравнение: 2x + 5 = 13',
    answers: [
      { text: 'x = 3', isCorrect: false },
      { text: 'x = 4', isCorrect: true },
      { text: 'x = 5', isCorrect: false },
      { text: 'x = 6', isCorrect: false }
    ],
    explanation: '2x + 5 = 13, следовательно 2x = 8, откуда x = 4.',
    category: 'Алгебра',
    difficulty: 'medium'
  }
];

const sampleExams = [
  {
    title: 'Пробный тест по математике',
    description: 'Тестирование знаний по основным разделам математики',
    timeLimit: 60, // 60 минут
    passingScore: 70 // 70% правильных ответов
  }
];

// Тестовые данные для заданий критического мышления
const sampleCriticalTasks = [
  {
    title: 'Анализ статистических данных',
    description: 'Проанализируйте представленные данные и сделайте выводы',
    content: 'В городе А население составляет 500,000 человек. За последние 5 лет количество автомобилей увеличилось с 150,000 до 250,000. Проанализируйте эту ситуацию и предложите возможные решения транспортных проблем.',
    category: 'Анализ данных',
    difficulty: 'medium',
    tags: ['статистика', 'анализ', 'транспорт'],
    sampleAnswer: 'Рост количества автомобилей на 67% при неизменном населении указывает на улучшение экономической ситуации, но может привести к транспортным проблемам. Возможные решения: развитие общественного транспорта, создание велосипедных дорожек, введение платных парковок в центре города.'
  },
  {
    title: 'Этическая дилемма',
    description: 'Рассмотрите этическую проблему и предложите решение',
    content: 'Компания разрабатывает новое лекарство, которое может спасти тысячи жизней, но тестирование требует экспериментов на животных. Как следует поступить компании?',
    category: 'Этика',
    difficulty: 'hard',
    tags: ['этика', 'медицина', 'животные'],
    sampleAnswer: 'Необходимо найти баланс между потенциальной пользой для людей и этическими соображениями. Следует использовать альтернативные методы тестирования где возможно, минимизировать страдания животных, обеспечить строгий этический надзор и прозрачность процесса.'
  }
];

// Функция для очистки базы данных
async function clearDatabase() {
  try {
    await Module.deleteMany({});
    await Course.deleteMany({});
    await Resource.deleteMany({});
    await Question.deleteMany({});
    await Exam.deleteMany({});
    await CriticalTask.deleteMany({});
    console.log('🗑️ База данных очищена');
  } catch (error) {
    console.error('❌ Ошибка при очистке базы данных:', error);
  }
}

// Функция для заполнения базы данных
async function seedDatabase() {
  try {
    // Создание модулей
    const modules = await Module.insertMany(sampleModules);
    console.log(`✅ Создано ${modules.length} модулей`);

    // Создание курсов
    const courses = await Course.insertMany(sampleCourses);
    console.log(`✅ Создано ${courses.length} курсов`);

    // Создание ресурсов
    const resources = await Resource.insertMany(sampleResources);
    console.log(`✅ Создано ${resources.length} ресурсов`);

    // Создание вопросов
    const questions = await Question.insertMany(sampleQuestions);
    console.log(`✅ Создано ${questions.length} вопросов`);

    // Создание экзаменов с привязкой к вопросам
    const examsWithQuestions = sampleExams.map(exam => ({
      ...exam,
      questions: questions.map(q => q._id)
    }));
    const exams = await Exam.insertMany(examsWithQuestions);
    console.log(`✅ Создано ${exams.length} экзаменов`);

    // Создание заданий критического мышления
    const criticalTasks = await CriticalTask.insertMany(sampleCriticalTasks);
    console.log(`✅ Создано ${criticalTasks.length} заданий критического мышления`);

    console.log('🎉 Тестовые данные успешно добавлены в базу данных!');
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
  }
}

// Основная функция
async function main() {
  await connectDB();
  
  console.log('🚀 Начинаем заполнение базы данных тестовыми данными...');
  
  // Очищаем базу данных
  await clearDatabase();
  
  // Заполняем тестовыми данными
  await seedDatabase();
  
  // Закрываем соединение
  await mongoose.connection.close();
  console.log('✅ Соединение с базой данных закрыто');
}

// Запуск скрипта
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });
}

module.exports = { main };