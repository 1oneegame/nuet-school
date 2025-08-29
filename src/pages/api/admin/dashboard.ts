import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAdminAuth } from '../../../middleware/auth';
import dbConnect from '../../../backend/lib/dbConnect';
import User from '../../../backend/models/User';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    await dbConnect();

    // Получаем статистику системы
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({
      isEmailVerified: true,
      isWhatsAppVerified: true
    });
    const usersWithAccess = await User.countDocuments({
      hasStudentAccess: true
    });
    const adminUsers = await User.countDocuments({
      role: 'admin'
    });
    const lockedUsers = await User.countDocuments({
      lockUntil: { $gt: new Date() }
    });
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // За последние 7 дней
    });

    // Получаем последние регистрации
    const latestUsers = await User.find()
      .select('email firstName lastName role createdAt hasStudentAccess isEmailVerified isWhatsAppVerified')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Получаем информацию о текущем администраторе
    const currentAdmin = await User.findById(req.user!.userId)
      .select('-password -emailVerificationToken -whatsappVerificationCode')
      .lean();

    // Логируем доступ к админ-панели
    console.log(`Доступ к админ-панели: ${currentAdmin?.email} в ${new Date().toISOString()}`);

    // Обновляем время последнего входа администратора
    await User.findByIdAndUpdate(req.user!.userId, {
      lastLoginAt: new Date()
    });

    res.status(200).json({
      message: 'Добро пожаловать в административную панель!',
      admin: {
        id: currentAdmin?._id,
        email: currentAdmin?.email,
        firstName: currentAdmin?.firstName,
        lastName: currentAdmin?.lastName,
        fullName: `${currentAdmin?.firstName} ${currentAdmin?.lastName}`,
        role: currentAdmin?.role,
        lastLoginAt: currentAdmin?.lastLoginAt
      },
      statistics: {
        totalUsers,
        verifiedUsers,
        usersWithAccess,
        adminUsers,
        lockedUsers,
        recentRegistrations,
        verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
        accessRate: totalUsers > 0 ? Math.round((usersWithAccess / totalUsers) * 100) : 0
      },
      latestUsers: latestUsers.map(user => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hasStudentAccess: user.hasStudentAccess,
        isFullyVerified: user.isEmailVerified && user.isWhatsappVerified,
        registeredAt: user.createdAt
      })),
      systemInfo: {
        serverTime: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      },
      quickActions: [
        {
          title: 'Управление пользователями',
          description: 'Просмотр и управление доступом пользователей',
          url: '/admin/users',
          icon: 'users'
        },
        {
          title: 'Системные логи',
          description: 'Просмотр логов безопасности и активности',
          url: '/admin/logs',
          icon: 'logs'
        },
        {
          title: 'Настройки системы',
          description: 'Конфигурация системы и безопасности',
          url: '/admin/settings',
          icon: 'settings'
        }
      ],
      recentActivity: [
        {
          type: 'info',
          message: `Администратор ${currentAdmin?.firstName} ${currentAdmin?.lastName} вошел в систему`,
          timestamp: new Date().toISOString()
        },
        {
          type: 'success',
          message: `Всего пользователей в системе: ${totalUsers}`,
          timestamp: new Date().toISOString()
        },
        {
          type: 'warning',
          message: lockedUsers > 0 ? `Заблокированных аккаунтов: ${lockedUsers}` : 'Заблокированных аккаунтов нет',
          timestamp: new Date().toISOString()
        }
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка загрузки админ-панели:', error);
    res.status(500).json({ 
      message: 'Внутренняя ошибка сервера' 
    });
  }
};

// Экспортируем обработчик с защитой админского доступа
export default withAdminAuth(handler);