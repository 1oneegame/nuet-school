import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withStudentAuth } from '../../../middleware/auth';

// Тестовый API endpoint для проверки защиты студенческого дашборда
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    // Если мы дошли до этой точки, значит пользователь прошел все проверки
    res.status(200).json({
      success: true,
      message: 'Доступ к студенческому дашборду разрешен',
      user: {
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role,
        hasStudentAccess: req.user!.hasStudentAccess
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Ошибка в тестовом endpoint:', error);
    res.status(500).json({ 
      success: false,
      message: 'Внутренняя ошибка сервера' 
    });
  }
};

// Применяем middleware для защиты студенческого доступа
export default withStudentAuth(handler);