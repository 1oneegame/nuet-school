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
}

const EXAMS_FILE = path.join(process.cwd(), 'data', 'exams.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(EXAMS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load exams from file
const loadExams = (): Exam[] => {
  ensureDataDirectory();
  
  if (!fs.existsSync(EXAMS_FILE)) {
    // Create empty exams file
    const initialData: Exam[] = [];
    
    fs.writeFileSync(EXAMS_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  
  try {
    const data = fs.readFileSync(EXAMS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading exams:', error);
    return [];
  }
};

// Save exams to file
const saveExams = (exams: Exam[]): void => {
  ensureDataDirectory();
  fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2));
};

// Generate next ID
const getNextId = (exams: Exam[]): number => {
  if (exams.length === 0) return 1;
  return Math.max(...exams.map(e => e.id)) + 1;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const exams = loadExams();
    
    switch (req.method) {
      case 'GET':
        return res.status(200).json({
          success: true,
          data: exams
        });
        
      case 'POST':
        const { name, description, timeLimit } = req.body;
        
        if (!name || !description || !timeLimit) {
          return res.status(400).json({
            success: false,
            message: 'Все поля обязательны для заполнения'
          });
        }
        
        const newExam: Exam = {
          id: getNextId(exams),
          name,
          description,
          timeLimit: parseInt(timeLimit),
          mathQuestions: [],
          criticalQuestions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        exams.push(newExam);
        saveExams(exams);
        
        return res.status(201).json({
          success: true,
          data: newExam,
          message: 'Экзамен успешно создан'
        });
        
      case 'PUT':
        const { id, name: updateName, description: updateDescription, timeLimit: updateTimeLimit } = req.body;
        
        if (!id || !updateName || !updateDescription || !updateTimeLimit) {
          return res.status(400).json({
            success: false,
            message: 'Все поля обязательны для заполнения'
          });
        }
        
        const examIndex = exams.findIndex(e => e.id === parseInt(id));
        if (examIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Экзамен не найден'
          });
        }
        
        exams[examIndex] = {
          ...exams[examIndex],
          name: updateName,
          description: updateDescription,
          timeLimit: parseInt(updateTimeLimit),
          updatedAt: new Date().toISOString()
        };
        
        saveExams(exams);
        
        return res.status(200).json({
          success: true,
          data: exams[examIndex],
          message: 'Экзамен успешно обновлен'
        });
        
      case 'DELETE':
        const { id: deleteId } = req.body;
        
        if (!deleteId) {
          return res.status(400).json({
            success: false,
            message: 'ID экзамена обязателен'
          });
        }
        
        const deleteIndex = exams.findIndex(e => e.id === parseInt(deleteId));
        if (deleteIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Экзамен не найден'
          });
        }
        
        exams.splice(deleteIndex, 1);
        saveExams(exams);
        
        return res.status(200).json({
          success: true,
          message: 'Экзамен успешно удален'
        });
        
      default:
        return res.status(405).json({
          success: false,
          message: 'Метод не поддерживается'
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
}