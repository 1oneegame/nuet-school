// Типы для пользователей
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

// Типы для курсов и видео
export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number; // в секундах
  order: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  videos: Video[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  topics: Topic[];
  createdAt?: string;
  updatedAt?: string;
}

// Типы для экзаменов
export interface Answer {
  id?: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number; // в минутах
  passingScore: number; // процент правильных ответов
  createdAt?: string;
  updatedAt?: string;
}

export interface UserExamResult {
  id: string;
  userId: string;
  examId: string;
  score: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
  timeSpent: number; // в секундах
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Типы для критического мышления
export interface CriticalTask {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  sampleAnswer: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserTaskResult {
  id: string;
  userId: string;
  taskId: string;
  answer: string;
  feedback: string;
  score: number;
  timeSpent: number; // в секундах
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Типы для ресурсов
export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  type: 'book' | 'article' | 'video' | 'website' | 'tool' | 'other';
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Типы для редактируемых блоков лендинга
export interface HeroBlock {
  title: string;
  subtitle: string;
  buttons: {
    text: string;
    url: string;
    variant: 'primary' | 'secondary' | 'outline';
  }[];
}

export interface FeatureBlock {
  title: string;
  description: string;
  features: {
    title: string;
    description: string;
    icon: string;
    link?: string;
  }[];
}

export interface HowItWorksBlock {
  title: string;
  description: string;
  steps: {
    title: string;
    description: string;
    icon: string;
  }[];
}

export interface ResultsBlock {
  title: string;
  description: string;
  stats: {
    value: string;
    label: string;
  }[];
  cta: {
    text: string;
    url: string;
  };
}

export interface TestimonialBlock {
  title: string;
  description: string;
  testimonials: {
    text: string;
    author: string;
    role: string;
    avatar: string;
  }[];
}

export interface FaqBlock {
  title: string;
  description: string;
  faqs: {
    question: string;
    answer: string;
  }[];
  contactText: string;
  contactLink: string;
}

export interface LandingData {
  brandName: string;
  hero: HeroBlock;
  features: FeatureBlock;
  howItWorks: HowItWorksBlock;
  results: ResultsBlock;
  testimonials: TestimonialBlock;
  faq: FaqBlock;
}
