import * as jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { Types } from 'mongoose';
import dbConnect from '../backend/lib/dbConnect';
import User from '../backend/models/User';

// Интерфейс для расширенного запроса с информацией о пользователе
export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
    hasStudentAccess: boolean;
  };
}

// Middleware для проверки JWT токена
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Токен доступа не предоставлен',
        requiresAuth: true 
      });
    }

    // Верификация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Добавляем информацию о пользователе в запрос
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      hasStudentAccess: decoded.hasStudentAccess
    };

    next();
  } catch (error: any) {
    console.error('Ошибка аутентификации:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Токен истек. Пожалуйста, войдите в систему заново.',
        expired: true 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Недействительный токен',
        invalid: true 
      });
    }

    return res.status(401).json({ 
      message: 'Ошибка аутентификации' 
    });
  }
};

// Middleware для проверки роли администратора
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Пользователь не аутентифицирован' 
    });
  }

  if (req.user.role !== 'admin') {
    console.log(`Попытка доступа к админ-панели от пользователя ${req.user.email} (${req.user.role}) в ${new Date().toISOString()}`);
    
    return res.status(403).json({ 
      message: 'Доступ запрещен. Требуются права администратора.',
      requiredRole: 'admin',
      currentRole: req.user.role
    });
  }

  next();
};

// Middleware для проверки доступа к студенческому дашборду
export const requireStudentAccess = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Пользователь не аутентифицирован' 
    });
  }

  try {
    await dbConnect();
    
    // Получаем актуальную информацию о пользователе из базы данных
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Пользователь не найден' 
      });
    }

    // Проверяем верификацию аккаунта
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: 'Аккаунт не верифицирован. Подтвердите ваш email.',
        requiresVerification: true,
        emailVerified: user.isEmailVerified
      });
    }

    // Администраторы имеют полный доступ
    if (user.role === 'Admin') {
      next();
      return;
    }

    // Проверяем доступ к студенческому дашборду
    if (!user.hasStudentAccess) {
      console.log(`Попытка доступа к студенческому дашборду без разрешения: ${user.email} в ${new Date().toISOString()}`);
      
      return res.status(403).json({ 
        message: 'Доступ к студенческому дашборду не предоставлен. Обратитесь к администратору.',
        hasStudentAccess: false,
        contactInfo: '87058445248'
      });
    }

    // Обновляем информацию о пользователе в запросе
    req.user.hasStudentAccess = user.hasStudentAccess;
    
    next();
  } catch (error: any) {
    console.error('Ошибка проверки доступа к студенческому дашборду:', error);
    return res.status(500).json({ 
      message: 'Внутренняя ошибка сервера' 
    });
  }
};

// Комбинированный middleware для полной проверки студенческого доступа
export const authenticateStudentAccess = [
  authenticateToken,
  requireStudentAccess
];

// Комбинированный middleware для полной проверки админского доступа
export const authenticateAdminAccess = [
  authenticateToken,
  requireAdmin
];

// Утилита для применения middleware в API routes
export const withAuth = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  middlewares: Array<(req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => void>
) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    let middlewareIndex = 0;
    
    const runMiddleware = () => {
      if (middlewareIndex >= middlewares.length) {
        return handler(req, res);
      }
      
      const middleware = middlewares[middlewareIndex++];
      middleware(req, res, runMiddleware);
    };
    
    runMiddleware();
  };
};

// Экспорт готовых обработчиков
export const withStudentAuth = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => 
  withAuth(handler, authenticateStudentAccess);

export const withAdminAuth = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => 
  withAuth(handler, authenticateAdminAccess);