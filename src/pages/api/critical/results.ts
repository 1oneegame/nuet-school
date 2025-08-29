import { NextApiRequest, NextApiResponse } from 'next';
import { UserTaskResult } from '../../../backend/models/CriticalThinking';
import dbConnect from '../../../backend/lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({
      success: false,
      message: 'Необходима авторизация'
    });
  }

  switch (req.method) {
    case 'GET':
      try {
        const results = await UserTaskResult.find({ user: session.user.id })
          .populate('task', 'title category difficulty')
          .sort({ createdAt: -1 })
          .select('-__v');

        return res.status(200).json({
          success: true,
          data: results,
          message: 'Результаты успешно получены'
        });
      } catch (error) {
        console.error('Error fetching task results:', error);
        return res.status(500).json({
          success: false,
          message: 'Ошибка при получении результатов'
        });
      }

    case 'POST':
      try {
        const {
          taskId,
          answer,
          timeSpent
        } = req.body;

        // Валидация обязательных полей
        if (!taskId || !answer || timeSpent === undefined) {
          return res.status(400).json({
            success: false,
            message: 'Все обязательные поля должны быть заполнены'
          });
        }

        // Проверяем, не существует ли уже результат для этой задачи
        const existingResult = await UserTaskResult.findOne({
          user: session.user.id,
          task: taskId
        });

        if (existingResult) {
          // Обновляем существующий результат
          existingResult.answer = answer;
          existingResult.timeSpent = timeSpent;
          existingResult.completed = true;
          existingResult.updatedAt = new Date();
          
          const updatedResult = await existingResult.save();
          
          return res.status(200).json({
            success: true,
            data: updatedResult,
            message: 'Результат успешно обновлен'
          });
        } else {
          // Создаем новый результат
          const newResult = new UserTaskResult({
            user: session.user.id,
            task: taskId,
            answer,
            timeSpent,
            completed: true
          });

          const savedResult = await newResult.save();

          return res.status(201).json({
            success: true,
            data: savedResult,
            message: 'Результат успешно сохранен'
          });
        }
      } catch (error) {
        console.error('Error saving task result:', error);
        return res.status(500).json({
          success: false,
          message: 'Ошибка при сохранении результата'
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Метод не поддерживается'
      });
  }
}