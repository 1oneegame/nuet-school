import { NextApiRequest, NextApiResponse } from 'next';
import { CriticalTask } from '../../../backend/models/CriticalThinking';
import connectDB from '../../../backend/config/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const tasks = await CriticalTask.find()
          .sort({ createdAt: -1 })
          .select('-__v');

        return res.status(200).json({
          success: true,
          data: tasks,
          message: 'Задачи успешно получены'
        });
      } catch (error) {
        console.error('Error fetching critical tasks:', error);
        return res.status(500).json({
          success: false,
          message: 'Ошибка при получении задач'
        });
      }

    case 'POST':
      try {
        const {
          title,
          description,
          content,
          category,
          difficulty,
          tags,
          sampleAnswer
        } = req.body;

        // Валидация обязательных полей
        if (!title || !description || !content || !category || !sampleAnswer) {
          return res.status(400).json({
            success: false,
            message: 'Все обязательные поля должны быть заполнены'
          });
        }

        const newTask = new CriticalTask({
          title,
          description,
          content,
          category,
          difficulty: difficulty || 'medium',
          tags: tags || [],
          sampleAnswer
        });

        const savedTask = await newTask.save();

        return res.status(201).json({
          success: true,
          data: savedTask,
          message: 'Задача успешно создана'
        });
      } catch (error) {
        console.error('Error creating critical task:', error);
        return res.status(500).json({
          success: false,
          message: 'Ошибка при создании задачи'
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Метод не поддерживается'
      });
  }
}