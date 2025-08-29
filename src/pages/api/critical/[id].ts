import { NextApiRequest, NextApiResponse } from 'next';
import { CriticalTask } from '../../../backend/models/CriticalThinking';
import connectDB from '../../../backend/config/database';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  const { id } = req.query;

  // Проверка валидности ID
  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({
      success: false,
      message: 'Неверный ID задачи'
    });
  }

  switch (req.method) {
    case 'GET':
      try {
        const task = await CriticalTask.findById(id).select('-__v');

        if (!task) {
          return res.status(404).json({
            success: false,
            message: 'Задача не найдена'
          });
        }

        return res.status(200).json({
          success: true,
          data: task,
          message: 'Задача успешно получена'
        });
      } catch (error) {
        console.error('Error fetching critical task:', error);
        return res.status(500).json({
          success: false,
          message: 'Ошибка при получении задачи'
        });
      }

    case 'PUT':
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

        const updatedTask = await CriticalTask.findByIdAndUpdate(
          id,
          {
            title,
            description,
            content,
            category,
            difficulty,
            tags,
            sampleAnswer,
            updatedAt: new Date()
          },
          { new: true, runValidators: true }
        ).select('-__v');

        if (!updatedTask) {
          return res.status(404).json({
            success: false,
            message: 'Задача не найдена'
          });
        }

        return res.status(200).json({
          success: true,
          data: updatedTask,
          message: 'Задача успешно обновлена'
        });
      } catch (error) {
        console.error('Error updating critical task:', error);
        return res.status(500).json({
          success: false,
          message: 'Ошибка при обновлении задачи'
        });
      }

    case 'DELETE':
      try {
        const deletedTask = await CriticalTask.findByIdAndDelete(id);

        if (!deletedTask) {
          return res.status(404).json({
            success: false,
            message: 'Задача не найдена'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Задача успешно удалена'
        });
      } catch (error) {
        console.error('Error deleting critical task:', error);
        return res.status(500).json({
          success: false,
          message: 'Ошибка при удалении задачи'
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Метод не поддерживается'
      });
  }
}