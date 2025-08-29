import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';

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
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'questions');

// Ensure directories exist
const ensureDirectories = () => {
  const dataDir = path.dirname(EXAMS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
};

// Load exams from file
const loadExams = (): Exam[] => {
  ensureDirectories();
  
  if (!fs.existsSync(EXAMS_FILE)) {
    return [];
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
  ensureDirectories();
  fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2));
};

// Generate next question ID
const getNextQuestionId = (exams: Exam[]): number => {
  let maxId = 0;
  exams.forEach(exam => {
    exam.mathQuestions.forEach(q => {
      if (q.id > maxId) maxId = q.id;
    });
    exam.criticalQuestions.forEach(q => {
      if (q.id > maxId) maxId = q.id;
    });
  });
  return maxId + 1;
};

// Handle file upload
const handleFileUpload = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: UPLOADS_DIR,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filename: (name, ext, part) => {
        return `${uuidv4()}${ext}`;
      }
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const exams = loadExams();
    
    switch (req.method) {
      case 'POST':
        try {
          const { fields, files } = await handleFileUpload(req);
          
          const examId = parseInt(Array.isArray(fields.examId) ? fields.examId[0] : fields.examId || '0');
          const question = Array.isArray(fields.question) ? fields.question[0] : fields.question || '';
          const options = JSON.parse(Array.isArray(fields.options) ? fields.options[0] : fields.options || '[]');
          const correctAnswer = parseInt(Array.isArray(fields.correctAnswer) ? fields.correctAnswer[0] : fields.correctAnswer || '0');
          const explanation = Array.isArray(fields.explanation) ? fields.explanation[0] : fields.explanation || '';
          const subject = (Array.isArray(fields.subject) ? fields.subject[0] : fields.subject || 'math') as 'math' | 'critical';
          const hint = Array.isArray(fields.hint) ? fields.hint[0] : fields.hint || '';
          const videoExplanation = Array.isArray(fields.videoExplanation) ? fields.videoExplanation[0] : fields.videoExplanation || '';
          
          if (!examId || !question || !options.length || !explanation) {
            return res.status(400).json({
              success: false,
              message: 'Все обязательные поля должны быть заполнены'
            });
          }
          
          const examIndex = exams.findIndex(e => e.id === examId);
          if (examIndex === -1) {
            return res.status(404).json({
              success: false,
              message: 'Экзамен не найден'
            });
          }
          
          // Handle image upload
          let imageUrl = '';
          if (files.image) {
            const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
            if (imageFile && imageFile.filepath) {
              const filename = path.basename(imageFile.filepath);
              imageUrl = `/uploads/questions/${filename}`;
            }
          }
          
          const newQuestion: Question = {
            id: getNextQuestionId(exams),
            question,
            options,
            correctAnswer,
            explanation,
            subject,
            hint: hint || undefined,
            videoExplanation: videoExplanation || undefined,
            imageUrl: imageUrl || undefined
          };
          
          // Add question to appropriate array
          if (subject === 'math') {
            if (exams[examIndex].mathQuestions.length >= 30) {
              return res.status(400).json({
                success: false,
                message: 'Максимальное количество вопросов по математике (30) уже достигнуто'
              });
            }
            exams[examIndex].mathQuestions.push(newQuestion);
          } else {
            if (exams[examIndex].criticalQuestions.length >= 30) {
              return res.status(400).json({
                success: false,
                message: 'Максимальное количество вопросов по критическому мышлению (30) уже достигнуто'
              });
            }
            exams[examIndex].criticalQuestions.push(newQuestion);
          }
          
          exams[examIndex].updatedAt = new Date().toISOString();
          saveExams(exams);
          
          return res.status(201).json({
            success: true,
            data: newQuestion,
            message: 'Вопрос успешно создан'
          });
        } catch (error) {
          console.error('Error creating question:', error);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при создании вопроса'
          });
        }
        
      case 'PUT':
        try {
          const { fields, files } = await handleFileUpload(req);
          
          const questionId = parseInt(Array.isArray(fields.id) ? fields.id[0] : fields.id || '0');
          const examId = parseInt(Array.isArray(fields.examId) ? fields.examId[0] : fields.examId || '0');
          const question = Array.isArray(fields.question) ? fields.question[0] : fields.question || '';
          const options = JSON.parse(Array.isArray(fields.options) ? fields.options[0] : fields.options || '[]');
          const correctAnswer = parseInt(Array.isArray(fields.correctAnswer) ? fields.correctAnswer[0] : fields.correctAnswer || '0');
          const explanation = Array.isArray(fields.explanation) ? fields.explanation[0] : fields.explanation || '';
          const subject = (Array.isArray(fields.subject) ? fields.subject[0] : fields.subject || 'math') as 'math' | 'critical';
          const hint = Array.isArray(fields.hint) ? fields.hint[0] : fields.hint || '';
          const videoExplanation = Array.isArray(fields.videoExplanation) ? fields.videoExplanation[0] : fields.videoExplanation || '';
          
          if (!questionId || !examId || !question || !options.length || !explanation) {
            return res.status(400).json({
              success: false,
              message: 'Все обязательные поля должны быть заполнены'
            });
          }
          
          const examIndex = exams.findIndex(e => e.id === examId);
          if (examIndex === -1) {
            return res.status(404).json({
              success: false,
              message: 'Экзамен не найден'
            });
          }
          
          // Find question in both arrays
          let questionIndex = -1;
          let questionArray: Question[] = [];
          
          questionIndex = exams[examIndex].mathQuestions.findIndex(q => q.id === questionId);
          if (questionIndex !== -1) {
            questionArray = exams[examIndex].mathQuestions;
          } else {
            questionIndex = exams[examIndex].criticalQuestions.findIndex(q => q.id === questionId);
            if (questionIndex !== -1) {
              questionArray = exams[examIndex].criticalQuestions;
            }
          }
          
          if (questionIndex === -1) {
            return res.status(404).json({
              success: false,
              message: 'Вопрос не найден'
            });
          }
          
          // Handle image upload
          let imageUrl = questionArray[questionIndex].imageUrl;
          if (files.image) {
            const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
            if (imageFile && imageFile.filepath) {
              // Delete old image if exists
              if (imageUrl) {
                const oldImagePath = path.join(process.cwd(), 'public', imageUrl);
                if (fs.existsSync(oldImagePath)) {
                  fs.unlinkSync(oldImagePath);
                }
              }
              
              const filename = path.basename(imageFile.filepath);
              imageUrl = `/uploads/questions/${filename}`;
            }
          }
          
          // Update question
          questionArray[questionIndex] = {
            ...questionArray[questionIndex],
            question,
            options,
            correctAnswer,
            explanation,
            subject,
            hint: hint || undefined,
            videoExplanation: videoExplanation || undefined,
            imageUrl: imageUrl || undefined
          };
          
          exams[examIndex].updatedAt = new Date().toISOString();
          saveExams(exams);
          
          return res.status(200).json({
            success: true,
            data: questionArray[questionIndex],
            message: 'Вопрос успешно обновлен'
          });
        } catch (error) {
          console.error('Error updating question:', error);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении вопроса'
          });
        }
        
      case 'DELETE':
        const { id: deleteId } = req.body;
        
        if (!deleteId) {
          return res.status(400).json({
            success: false,
            message: 'ID вопроса обязателен'
          });
        }
        
        let found = false;
        for (let examIndex = 0; examIndex < exams.length; examIndex++) {
          // Check math questions
          let questionIndex = exams[examIndex].mathQuestions.findIndex(q => q.id === parseInt(deleteId));
          if (questionIndex !== -1) {
            const question = exams[examIndex].mathQuestions[questionIndex];
            
            // Delete image file if exists
            if (question.imageUrl) {
              const imagePath = path.join(process.cwd(), 'public', question.imageUrl);
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
            }
            
            exams[examIndex].mathQuestions.splice(questionIndex, 1);
            found = true;
            break;
          }
          
          // Check critical questions
          questionIndex = exams[examIndex].criticalQuestions.findIndex(q => q.id === parseInt(deleteId));
          if (questionIndex !== -1) {
            const question = exams[examIndex].criticalQuestions[questionIndex];
            
            // Delete image file if exists
            if (question.imageUrl) {
              const imagePath = path.join(process.cwd(), 'public', question.imageUrl);
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
            }
            
            exams[examIndex].criticalQuestions.splice(questionIndex, 1);
            found = true;
            break;
          }
        }
        
        if (!found) {
          return res.status(404).json({
            success: false,
            message: 'Вопрос не найден'
          });
        }
        
        saveExams(exams);
        
        return res.status(200).json({
          success: true,
          message: 'Вопрос успешно удален'
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