import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: 'math' | 'critical';
  hint?: string;
  videoExplanation?: string;
  imageUrl?: string;
}

interface Exam {
  id: number;
  name: string;
  description: string;
  timeLimit: number;
  mathQuestions: Question[];
  criticalQuestions: Question[];
  createdAt: string;
  updatedAt: string;
  published?: boolean;
  publishedAt?: string;
}

const EXAMS_FILE = path.join(process.cwd(), 'data', 'exams.json');

function loadExams(): Exam[] {
  try {
    if (fs.existsSync(EXAMS_FILE)) {
      const data = fs.readFileSync(EXAMS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Ошибка при загрузке экзаменов:', error);
    return [];
  }
}

function saveExams(exams: Exam[]): void {
  try {
    const dataDir = path.dirname(EXAMS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2));
  } catch (error) {
    console.error('Ошибка при сохранении экзаменов:', error);
    throw error;
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Метод не поддерживается'
    });
  }

  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID экзамена обязателен'
      });
    }

    const exams = loadExams();
    const examIndex = exams.findIndex(exam => exam.id === parseInt(id));
    
    if (examIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Экзамен не найден'
      });
    }

    const exam = exams[examIndex];
    
    // Проверяем, что экзамен готов к публикации
    if (exam.mathQuestions.length !== 30) {
      return res.status(400).json({
        success: false,
        message: 'Экзамен должен содержать ровно 30 математических вопросов'
      });
    }
    
    if (exam.criticalQuestions.length !== 30) {
      return res.status(400).json({
        success: false,
        message: 'Экзамен должен содержать ровно 30 вопросов по критическому мышлению'
      });
    }

    // Обновляем статус экзамена
    exams[examIndex] = {
      ...exam,
      published: true,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveExams(exams);

    return res.status(200).json({
      success: true,
      data: exams[examIndex],
      message: 'Экзамен успешно опубликован'
    });
    
  } catch (error) {
    console.error('Ошибка при публикации экзамена:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
}