import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAdminAuth } from '../../../middleware/auth';
import dbConnect from '../../../backend/lib/dbConnect';
import LoginAttempt from '../../../../backend/models/LoginAttempt';
import { getLoginStatistics } from '../../../utils/loginLogger';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { 
        page = '1', 
        limit = '20', 
        success, 
        suspicious, 
        email, 
        ipAddress,
        days = '7'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const daysNum = parseInt(days as string);
      const skip = (pageNum - 1) * limitNum;

      // Построение фильтра
      const filter: any = {};
      
      if (success !== undefined) {
        filter.success = success === 'true';
      }
      
      if (suspicious === 'true') {
        filter.isSuspicious = true;
      }
      
      if (email) {
        filter.email = { $regex: email, $options: 'i' };
      }
      
      if (ipAddress) {
        filter.ipAddress = ipAddress;
      }

      // Фильтр по времени
      if (daysNum > 0) {
        filter.attemptedAt = {
          $gte: new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000)
        };
      }

      // Получение логов с пагинацией
      const [logs, totalCount, statistics] = await Promise.all([
        LoginAttempt.find(filter)
          .populate('userId', 'email firstName lastName role')
          .sort({ attemptedAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        LoginAttempt.countDocuments(filter),
        getLoginStatistics(daysNum)
      ]);

      // Форматирование данных для фронтенда
      const formattedLogs = logs.map(log => ({
        id: log._id,
        email: log.email,
        success: log.success,
        failureReason: log.failureReason,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        location: log.location,
        deviceInfo: log.deviceInfo,
        loginMethod: log.loginMethod,
        attemptedAt: log.attemptedAt,
        isSuspicious: log.isSuspicious,
        suspiciousReasons: log.suspiciousReasons,
        user: log.userId ? {
          id: (log.userId as any)._id,
          email: (log.userId as any).email,
          name: `${(log.userId as any).firstName} ${(log.userId as any).lastName}`,
          role: (log.userId as any).role
        } : null,
        formattedTime: new Date(log.attemptedAt).toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Almaty'
        })
      }));

      const totalPages = Math.ceil(totalCount / limitNum);

      res.status(200).json({
        message: 'Логи попыток входа получены успешно',
        logs: formattedLogs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        statistics,
        filters: {
          success: success !== undefined ? success === 'true' : null,
          suspicious: suspicious === 'true',
          email: email || null,
          ipAddress: ipAddress || null,
          days: daysNum
        },
        summary: {
          totalInPeriod: totalCount,
          successfulInPeriod: formattedLogs.filter(log => log.success).length,
          failedInPeriod: formattedLogs.filter(log => !log.success).length,
          suspiciousInPeriod: formattedLogs.filter(log => log.isSuspicious).length
        }
      });

    } catch (error) {
      console.error('Ошибка получения логов входа:', error);
      res.status(500).json({ 
        message: 'Ошибка получения логов входа' 
      });
    }
  }

  else if (req.method === 'DELETE') {
    try {
      const { days = '30' } = req.query;
      const daysNum = parseInt(days as string);
      
      if (daysNum < 1) {
        return res.status(400).json({
          message: 'Количество дней должно быть больше 0'
        });
      }

      const cutoffDate = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);
      
      const result = await LoginAttempt.deleteMany({
        attemptedAt: { $lt: cutoffDate }
      });

      // Логируем действие администратора
      console.log(`Администратор ${req.user!.email} удалил ${result.deletedCount} записей логов старше ${daysNum} дней`);

      res.status(200).json({
        message: `Удалено ${result.deletedCount} записей логов старше ${daysNum} дней`,
        deletedCount: result.deletedCount,
        cutoffDate
      });

    } catch (error) {
      console.error('Ошибка удаления старых логов:', error);
      res.status(500).json({ 
        message: 'Ошибка удаления старых логов' 
      });
    }
  }

  else {
    res.status(405).json({ message: 'Метод не разрешен' });
  }
};

export default withAdminAuth(handler);