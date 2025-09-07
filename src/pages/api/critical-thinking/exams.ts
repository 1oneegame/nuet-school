import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../backend/lib/dbConnect';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    switch (req.method) {
      case 'GET':
        return res.status(200).json({
          success: true,
          data: [],
          message: 'Экзамены по критическому мышлению временно недоступны'
        });

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