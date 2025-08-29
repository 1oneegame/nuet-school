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

// Load exams from file system
const loadExams = (): Exam[] => {
  try {
    if (!fs.existsSync(EXAMS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(EXAMS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading exams:', error);
    return [];
  }
};

// Convert admin exam format to student format
const convertExamFormat = (exam: Exam) => {
  const allQuestions = [...exam.mathQuestions, ...exam.criticalQuestions].map(q => ({
    _id: q.id.toString(),
    question: q.question,
    answers: q.options.map((option, index) => ({
      text: option,
      isCorrect: index === q.correctAnswer
    })),
    explanation: q.explanation,
    videoExplanation: q.videoExplanation
  }));

  return {
    _id: exam.id.toString(),
    title: exam.name,
    description: exam.description,
    questions: allQuestions,
    timeLimit: exam.timeLimit,
    passingScore: 50 // Default passing score
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const allExams = loadExams();
      
      // Filter only published exams
      const publishedExams = allExams.filter(exam => exam.published === true);
      
      // Convert to student format
      const studentExams = publishedExams.map(convertExamFormat);
      
      return res.status(200).json({
        success: true,
        data: studentExams
      });
    } catch (error) {
      console.error('Error fetching exams:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при получении экзаменов'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Метод не поддерживается'
  });
}