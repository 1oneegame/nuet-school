import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../backend/lib/dbConnect';
import { CriticalThinkingExam, CriticalThinkingQuestion } from '../../../../backend/models/CriticalThinking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    switch (req.method) {
      case 'GET':
        try {
          const exams = await CriticalThinkingExam.find()
            .populate('questions')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

          return res.status(200).json({
            success: true,
            data: exams
          });
        } catch (error) {
          console.error('Error fetching critical thinking exams:', error);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при получении экзаменов'
          });
        }

      case 'POST':
        try {
          const { title, description, timeLimit, difficulty } = req.body;

          if (!title || !description || !timeLimit) {
            return res.status(400).json({
              success: false,
              message: 'Название, описание и время выполнения обязательны'
            });
          }

          const newExam = new CriticalThinkingExam({
            title,
            description,
            timeLimit,
            difficulty: difficulty || 'mixed',
            questions: [],
            createdBy: req.body.userId // В реальном приложении получать из сессии
          });

          const savedExam = await newExam.save();
          const populatedExam = await CriticalThinkingExam.findById(savedExam._id)
            .populate('questions')
            .populate('createdBy', 'name email');

          return res.status(201).json({
            success: true,
            data: populatedExam,
            message: 'Экзамен успешно создан'
          });
        } catch (error) {
          console.error('Error creating critical thinking exam:', error);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при создании экзамена'
          });
        }

      case 'PUT':
        try {
          const { id } = req.query;
          const { title, description, timeLimit, difficulty, isPublished } = req.body;

          if (!id) {
            return res.status(400).json({
              success: false,
              message: 'ID экзамена обязателен'
            });
          }

          const updateData: any = {
            updatedBy: req.body.userId // В реальном приложении получать из сессии
          };

          if (title) updateData.title = title;
          if (description) updateData.description = description;
          if (timeLimit) updateData.timeLimit = timeLimit;
          if (difficulty) updateData.difficulty = difficulty;
          if (typeof isPublished === 'boolean') {
            updateData.isPublished = isPublished;
            if (isPublished) {
              updateData.publishedAt = new Date();
            }
          }

          const updatedExam = await CriticalThinkingExam.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
          ).populate('questions').populate('createdBy', 'name email');

          if (!updatedExam) {
            return res.status(404).json({
              success: false,
              message: 'Экзамен не найден'
            });
          }

          return res.status(200).json({
            success: true,
            data: updatedExam,
            message: 'Экзамен успешно обновлен'
          });
        } catch (error) {
          console.error('Error updating critical thinking exam:', error);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении экзамена'
          });
        }

      case 'DELETE':
        try {
          const { id } = req.query;

          if (!id) {
            return res.status(400).json({
              success: false,
              message: 'ID экзамена обязателен'
            });
          }

          const exam = await CriticalThinkingExam.findById(id);
          if (!exam) {
            return res.status(404).json({
              success: false,
              message: 'Экзамен не найден'
            });
          }

          // Удаляем все вопросы экзамена
          if (exam.questions && exam.questions.length > 0) {
            await CriticalThinkingQuestion.deleteMany({
              _id: { $in: exam.questions }
            });
          }

          // Удаляем сам экзамен
          await CriticalThinkingExam.findByIdAndDelete(id);

          return res.status(200).json({
            success: true,
            message: 'Экзамен и все связанные вопросы успешно удалены'
          });
        } catch (error) {
          console.error('Error deleting critical thinking exam:', error);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при удалении экзамена'
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
    console.error('Critical thinking exams API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
}