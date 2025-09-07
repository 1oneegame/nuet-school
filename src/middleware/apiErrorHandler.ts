import { NextApiRequest, NextApiResponse } from 'next';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      
      await handler(req, res);
    } catch (error: any) {
      console.error('API Error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
      });

      if (!res.headersSent) {
        let statusCode = 500;
        let message = 'Внутренняя ошибка сервера';

        if (error.statusCode) {
          statusCode = error.statusCode;
          message = error.message;
        } else if (error.name === 'ValidationError') {
          statusCode = 400;
          message = 'Ошибка валидации данных';
        } else if (error.name === 'CastError') {
          statusCode = 400;
          message = 'Некорректные данные';
        } else if (error.code === 11000) {
          statusCode = 409;
          message = 'Данные уже существуют';
        } else if (error.message?.includes('timeout')) {
          statusCode = 503;
          message = 'Превышено время ожидания';
        } else if (error.name === 'MongoNetworkError') {
          statusCode = 503;
          message = 'Ошибка подключения к базе данных';
        } else if (error.name === 'JsonWebTokenError') {
          statusCode = 401;
          message = 'Недействительный токен';
        } else if (error.name === 'TokenExpiredError') {
          statusCode = 401;
          message = 'Токен истек';
        }

        return res.status(statusCode).json({
          success: false,
          message,
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };
}

export function createApiError(message: string, statusCode: number = 500): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  return error;
}
