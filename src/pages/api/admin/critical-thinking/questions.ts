import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '../../../../backend/lib/dbConnect';
import { CriticalThinkingQuestion, CriticalThinkingExam } from '../../../../backend/models/CriticalThinking';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'critical-thinking');

// Ensure upload directory exists
const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
};

// Handle file upload
const handleFileUpload = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    ensureUploadDir();
    
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
    await dbConnect();

    switch (req.method) {
      case 'GET':
        try {
          const { examId, questionId } = req.query;

          if (questionId) {
            // Get specific question
            const question = await CriticalThinkingQuestion.findById(questionId)
              .populate('createdBy', 'name email');
            
            if (!question) {
              return res.status(404).json({
                success: false,
                message: 'Вопрос не найден'
              });
            }

            return res.status(200).json({
              success: true,
              data: question
            });
          }

          if (examId) {
            // Get questions for specific exam
            const exam = await CriticalThinkingExam.findById(examId)
              .populate('questions');
            
            if (!exam) {
              return res.status(404).json({
                success: false,
                message: 'Экзамен не найден'
              });
            }

            return res.status(200).json({
              success: true,
              data: exam.questions
            });
          }

          // Get all questions
          const questions = await CriticalThinkingQuestion.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

          return res.status(200).json({
            success: true,
            data: questions
          });
        } catch (error) {
          console.error('Error fetching critical thinking questions:', error);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при получении вопросов'
          });
        }

      case 'POST':
        try {
          const { fields, files } = await handleFileUpload(req);
          
          const examId = Array.isArray(fields.examId) ? fields.examId[0] : fields.examId;
          const question = Array.isArray(fields.question) ? fields.question[0] : fields.question;
          const options = JSON.parse(Array.isArray(fields.options) ? fields.options[0] : fields.options || '[]');
          const correctAnswer = parseInt(Array.isArray(fields.correctAnswer) ? fields.correctAnswer[0] : fields.correctAnswer || '0');
          const explanation = Array.isArray(fields.explanation) ? fields.explanation[0] : fields.explanation;
          const textExplanation = Array.isArray(fields.textExplanation) ? fields.textExplanation[0] : fields.textExplanation;
          const hint = Array.isArray(fields.hint) ? fields.hint[0] : fields.hint;
          const difficulty = Array.isArray(fields.difficulty) ? fields.difficulty[0] : fields.difficulty || 'medium';
          const category = Array.isArray(fields.category) ? fields.category[0] : fields.category || 'logic';
          const tags = fields.tags ? JSON.parse(Array.isArray(fields.tags) ? fields.tags[0] : fields.tags) : [];

          console.log('POST /api/admin/critical-thinking/questions - Received data:', {
            examId,
            question,
            options,
            explanation,
            fieldsKeys: Object.keys(fields)
          });

          if (!examId || !question || !options.length || !explanation) {
            console.log('Validation failed:', {
              examId: !!examId,
              question: !!question,
              optionsLength: options.length,
              explanation: !!explanation
            });
            return res.status(400).json({
              success: false,
              message: 'Экзамен, вопрос, варианты ответов и объяснение обязательны'
            });
          }

          // Check if exam exists
          const exam = await CriticalThinkingExam.findById(examId);
          if (!exam) {
            return res.status(404).json({
              success: false,
              message: 'Экзамен не найден'
            });
          }

          // Handle image upload
          let imageUrl = '';
          let imagePath = '';
          if (files.image) {
            const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
            if (imageFile && imageFile.filepath) {
              const filename = path.basename(imageFile.filepath);
              imageUrl = `/uploads/critical-thinking/${filename}`;
              imagePath = imageFile.filepath;
            }
          }

          const newQuestion = new CriticalThinkingQuestion({
            question,
            options,
            correctAnswer,
            explanation,
            textExplanation: textExplanation || undefined,
            hint: hint || undefined,
            difficulty,
            category,
            tags,
            imageUrl: imageUrl || undefined,
            imagePath: imagePath || undefined,
            createdBy: fields.userId // В реальном приложении получать из сессии
          });

          const savedQuestion = await newQuestion.save();

          // Add question to exam
          exam.questions.push(savedQuestion._id);
          await exam.save();

          const populatedQuestion = await CriticalThinkingQuestion.findById(savedQuestion._id)
            .populate('createdBy', 'name email');

          return res.status(201).json({
            success: true,
            data: populatedQuestion,
            message: 'Вопрос успешно создан'
          });
        } catch (error) {
          console.error('Error creating critical thinking question:', error);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при создании вопроса'
          });
        }

      case 'PUT':
        try {
          const { fields, files } = await handleFileUpload(req);
          
          const questionId = Array.isArray(fields.questionId) ? fields.questionId[0] : fields.questionId;
          
          if (!questionId) {
            return res.status(400).json({
              success: false,
              message: 'ID вопроса обязателен'
            });
          }

          const existingQuestion = await CriticalThinkingQuestion.findById(questionId);
          if (!existingQuestion) {
            return res.status(404).json({
              success: false,
              message: 'Вопрос не найден'
            });
          }

          const updateData: any = {
            updatedBy: fields.userId // В реальном приложении получать из сессии
          };

          // Update fields if provided
          if (fields.question) {
            updateData.question = Array.isArray(fields.question) ? fields.question[0] : fields.question;
          }
          if (fields.options) {
            updateData.options = JSON.parse(Array.isArray(fields.options) ? fields.options[0] : fields.options);
          }
          if (fields.correctAnswer) {
            updateData.correctAnswer = parseInt(Array.isArray(fields.correctAnswer) ? fields.correctAnswer[0] : fields.correctAnswer);
          }
          if (fields.explanation) {
            updateData.explanation = Array.isArray(fields.explanation) ? fields.explanation[0] : fields.explanation;
          }
          if (fields.textExplanation) {
            updateData.textExplanation = Array.isArray(fields.textExplanation) ? fields.textExplanation[0] : fields.textExplanation;
          }
          if (fields.hint) {
            updateData.hint = Array.isArray(fields.hint) ? fields.hint[0] : fields.hint;
          }
          if (fields.difficulty) {
            updateData.difficulty = Array.isArray(fields.difficulty) ? fields.difficulty[0] : fields.difficulty;
          }
          if (fields.category) {
            updateData.category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
          }
          if (fields.tags) {
            updateData.tags = JSON.parse(Array.isArray(fields.tags) ? fields.tags[0] : fields.tags);
          }

          // Handle image upload
          if (files.image) {
            const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
            if (imageFile && imageFile.filepath) {
              // Delete old image if exists
              if (existingQuestion.imagePath && fs.existsSync(existingQuestion.imagePath)) {
                fs.unlinkSync(existingQuestion.imagePath);
              }
              
              const filename = path.basename(imageFile.filepath);
              updateData.imageUrl = `/uploads/critical-thinking/${filename}`;
              updateData.imagePath = imageFile.filepath;
            }
          }

          const updatedQuestion = await CriticalThinkingQuestion.findByIdAndUpdate(
            questionId,
            updateData,
            { new: true, runValidators: true }
          ).populate('createdBy', 'name email');

          return res.status(200).json({
            success: true,
            data: updatedQuestion,
            message: 'Вопрос успешно обновлен'
          });
        } catch (error) {
          console.error('Error updating critical thinking question:', error);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении вопроса'
          });
        }

      case 'DELETE':
        try {
          const { id } = req.query;

          if (!id) {
            return res.status(400).json({
              success: false,
              message: 'ID вопроса обязателен'
            });
          }

          const question = await CriticalThinkingQuestion.findById(id);
          if (!question) {
            return res.status(404).json({
              success: false,
              message: 'Вопрос не найден'
            });
          }

          // Delete image file if exists
          if (question.imagePath && fs.existsSync(question.imagePath)) {
            fs.unlinkSync(question.imagePath);
          }

          // Remove question from all exams
          await CriticalThinkingExam.updateMany(
            { questions: id },
            { $pull: { questions: id } }
          );

          // Delete the question
          await CriticalThinkingQuestion.findByIdAndDelete(id);

          return res.status(200).json({
            success: true,
            message: 'Вопрос успешно удален'
          });
        } catch (error) {
          console.error('Error deleting critical thinking question:', error);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при удалении вопроса'
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          message: `Метод ${req.method} не поддерживается`
        });
    }
  } catch (error) {
    console.error('Critical thinking questions API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
}