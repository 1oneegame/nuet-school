import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../backend/lib/dbConnect';
const { CriticalThinkingExam } = require('../../../models/CriticalThinking');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    switch (req.method) {
      case 'GET':
        try {
          // Получаем только опубликованные экзамены для студентов
          const exams = await CriticalThinkingExam.find({ isPublished: true })
            .populate('questions')
            .sort({ createdAt: -1 })
            .select('-createdBy -updatedBy -__v');

          return res.status(200).json({
            success: true,
            data: exams,
            message: 'Экзамены успешно получены'
          });
        } catch (error) {
          console.error('Error fetching published critical thinking exams:', error);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при получении экзаменов'
          });
        }

      default:
        res.setHeader('Allow', ['GET']);
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