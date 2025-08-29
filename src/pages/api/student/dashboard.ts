import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withStudentAuth } from '../../../middleware/auth';
import dbConnect from '../../../backend/lib/dbConnect';
import User from '../../../backend/models/User';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    await dbConnect();

    // Получаем информацию о пользователе
    const user = await User.findById(req.user!.userId)
      .select('-password -emailVerificationToken -whatsappVerificationCode')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Обновляем время последнего входа
    await User.findByIdAndUpdate(req.user!.userId, {
      lastLoginAt: new Date()
    });

    // Логируем успешный доступ к дашборду
    console.log(`Успешный доступ к студенческому дашборду: ${user.email} в ${new Date().toISOString()}`);

    // Возвращаем данные дашборда
    res.status(200).json({
      message: 'Добро пожаловать в студенческий дашборд!',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        hasStudentAccess: user.hasStudentAccess,
        isEmailVerified: user.isEmailVerified,
        isWhatsAppVerified: user.isWhatsappVerified,
        registrationDate: user.registrationDate,
        lastLoginAt: user.lastLoginAt,
        accessGrantedAt: user.accessGrantedAt
      },
      dashboardData: {
        welcomeMessage: `Привет, ${user.firstName}! Добро пожаловать в студенческий дашборд.`,
        accessLevel: 'student',
        features: [
          'Просмотр учебных материалов',
          'Прохождение экзаменов',
          'Выполнение заданий Critical Thinking',
          'Отслеживание прогресса обучения'
        ],
        notifications: [
          {
            type: 'info',
            message: 'Добро пожаловать в систему обучения!',
            timestamp: new Date().toISOString()
          }
        ]
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка загрузки дашборда:', error);
    res.status(500).json({ 
      message: 'Внутренняя ошибка сервера' 
    });
  }
};

// Экспортируем обработчик с защитой студенческого доступа
export default withStudentAuth(handler);