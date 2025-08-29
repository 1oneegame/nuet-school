import { NextApiResponse } from 'next';
import dbConnect from '../../../backend/lib/dbConnect';
import User from '../../../backend/models/User';
import { AuthenticatedRequest, withAdminAuth } from '../../../middleware/auth';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return await getUsers(req, res);
    case 'PUT':
      return await updateUserAccess(req, res);
    case 'DELETE':
      return await deleteUser(req, res);
    default:
      return res.status(405).json({ message: 'Метод не разрешен' });
  }
};

// Получение списка всех пользователей
const getUsers = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', accessStatus = '' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Построение фильтра поиска
    const searchFilter: any = {};
    
    if (search) {
      searchFilter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { whatsappNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      searchFilter.role = role;
    }
    
    if (accessStatus === 'granted') {
      searchFilter.hasStudentAccess = true;
    } else if (accessStatus === 'denied') {
      searchFilter.hasStudentAccess = false;
    }

    // Получение пользователей с пагинацией
    const users = await User.find(searchFilter)
      .select('-password -emailVerificationToken -whatsappVerificationCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Подсчет общего количества пользователей
    const totalUsers = await User.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalUsers / limitNum);

    // Статистика пользователей
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: {
            $sum: {
              $cond: [
                { $and: ['$isEmailVerified', '$isWhatsAppVerified'] },
                1,
                0
              ]
            }
          },
          usersWithAccess: {
            $sum: {
              $cond: ['$hasStudentAccess', 1, 0]
            }
          },
          adminUsers: {
            $sum: {
              $cond: [{ $eq: ['$role', 'Admin'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const statistics = stats[0] || {
      totalUsers: 0,
      verifiedUsers: 0,
      usersWithAccess: 0,
      adminUsers: 0
    };

    res.status(200).json({
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        whatsappNumber: user.whatsappNumber,
        role: user.role,
        hasStudentAccess: user.hasStudentAccess,
        isSchoolStudent: user.isSchoolStudent,
        isEmailVerified: user.isEmailVerified,
        isWhatsAppVerified: user.isWhatsappVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        accessGrantedBy: user.accessGrantedBy,
        accessGrantedAt: user.accessGrantedAt,
        loginAttempts: user.loginAttempts,
        isAccountLocked: user.lockUntil && user.lockUntil > new Date()
      })),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      statistics
    });

  } catch (error) {
    console.error('Ошибка получения списка пользователей:', error);
    res.status(500).json({ 
      message: 'Внутренняя ошибка сервера' 
    });
  }
};

// Обновление доступа пользователя к студенческому дашборду
const updateUserAccess = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { userId, hasStudentAccess, isSchoolStudent, reason } = req.body;

    if (!userId || (typeof hasStudentAccess !== 'boolean' && typeof isSchoolStudent !== 'boolean')) {
      return res.status(400).json({ 
        message: 'ID пользователя и статус доступа или тип ученика обязательны' 
      });
    }

    // Поиск пользователя
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'Пользователь не найден' 
      });
    }

    // Проверяем, что не пытаемся изменить доступ администратора
    if (user.role === 'Admin') {
      return res.status(400).json({ 
        message: 'Нельзя изменить доступ администратора' 
      });
    }

    // Обновление доступа и статуса ученика школы
    const previousAccess = user.hasStudentAccess;
    const previousSchoolStatus = user.isSchoolStudent;
    
    if (typeof hasStudentAccess === 'boolean') {
      user.hasStudentAccess = hasStudentAccess;
      
      if (hasStudentAccess) {
        user.accessGrantedBy = req.user!.userId;
        user.accessGrantedAt = new Date();
      } else {
        user.accessRevokedBy = req.user!.userId;
        user.accessRevokedAt = new Date();
        user.accessRevokedReason = reason || 'Не указана';
      }
    }
    
    if (typeof isSchoolStudent === 'boolean') {
      user.isSchoolStudent = isSchoolStudent;
    }

    await user.save();

    // Логирование изменений
    const adminEmail = req.user!.email;
    let logMessage = '';
    
    if (typeof hasStudentAccess === 'boolean') {
      const action = hasStudentAccess ? 'предоставлен' : 'отозван';
      logMessage += `Доступ к дашборду ${action} для пользователя ${user.email}. `;
    }
    
    if (typeof isSchoolStudent === 'boolean') {
      const studentType = isSchoolStudent ? 'ученик школы' : 'внешний пользователь';
      logMessage += `Статус изменен на: ${studentType}. `;
    }
    
    if (logMessage) {
      console.log(`${logMessage}Администратор: ${adminEmail}. Время: ${new Date().toISOString()}. Причина: ${reason || 'Не указана'}`);
    }

    let responseMessage = 'Данные пользователя обновлены';
    if (typeof hasStudentAccess === 'boolean' && typeof isSchoolStudent === 'boolean') {
      responseMessage = `Доступ к дашборду ${hasStudentAccess ? 'предоставлен' : 'отозван'} и статус изменен на ${isSchoolStudent ? 'ученик школы' : 'внешний пользователь'}`;
    } else if (typeof hasStudentAccess === 'boolean') {
      responseMessage = `Доступ к студенческому дашборду ${hasStudentAccess ? 'предоставлен' : 'отозван'}`;
    } else if (typeof isSchoolStudent === 'boolean') {
      responseMessage = `Статус пользователя изменен на ${isSchoolStudent ? 'ученик школы' : 'внешний пользователь'}`;
    }

    res.status(200).json({
      message: responseMessage,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        hasStudentAccess: user.hasStudentAccess,
        isSchoolStudent: user.isSchoolStudent,
        accessGrantedAt: user.accessGrantedAt,
        accessRevokedAt: user.accessRevokedAt
      },
      changes: {
        previousAccess,
        newAccess: user.hasStudentAccess,
        previousSchoolStatus,
        newSchoolStatus: user.isSchoolStudent
      }
    });

  } catch (error) {
    console.error('Ошибка обновления доступа пользователя:', error);
    res.status(500).json({ 
      message: 'Внутренняя ошибка сервера' 
    });
  }
};

// Удаление пользователя
const deleteUser = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        message: 'ID пользователя обязателен' 
      });
    }

    // Поиск пользователя
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'Пользователь не найден' 
      });
    }

    // Проверяем, что не пытаемся удалить администратора
    if (user.role === 'Admin') {
      return res.status(400).json({ 
        message: 'Нельзя удалить администратора' 
      });
    }

    // Проверяем, что не пытаемся удалить самого себя
    if ((user._id as any).toString() === req.user!.userId) {
      return res.status(400).json({ 
        message: 'Нельзя удалить собственный аккаунт' 
      });
    }

    // Удаляем пользователя
    await User.findByIdAndDelete(userId);

    // Логирование удаления
    const adminEmail = req.user!.email;
    console.log(`Пользователь ${user.email} (${user.firstName} ${user.lastName}) удален администратором ${adminEmail} в ${new Date().toISOString()}`);

    res.status(200).json({
      message: 'Пользователь успешно удален',
      deletedUser: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ 
      message: 'Внутренняя ошибка сервера' 
    });
  }
};

export default withAdminAuth(handler);