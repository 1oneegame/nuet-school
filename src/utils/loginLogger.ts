import { NextApiRequest } from 'next';
import { UAParser } from 'ua-parser-js';

const LoginAttempt = require('../../backend/models/LoginAttempt');

interface LoginLogData {
  userId?: string;
  email: string;
  success: boolean;
  failureReason?: string;
  loginMethod?: 'EMAIL_PASSWORD' | 'TOKEN_REFRESH' | 'ADMIN_LOGIN';
  metadata?: any;
}

interface DeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
  isMobile: boolean;
}

interface LocationInfo {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
}

/**
 * Извлекает IP адрес из запроса
 */
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const realIP = req.headers['x-real-ip'] as string;
  const remoteAddress = req.socket?.remoteAddress;
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return remoteAddress || 'unknown';
}

/**
 * Парсит User-Agent для получения информации об устройстве
 */
function parseUserAgent(userAgent: string): DeviceInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: result.browser.name ? `${result.browser.name} ${result.browser.version}` : undefined,
    os: result.os.name ? `${result.os.name} ${result.os.version}` : undefined,
    device: result.device.model || result.device.type || undefined,
    isMobile: result.device.type === 'mobile' || result.device.type === 'tablet'
  };
}

/**
 * Получает геолокацию по IP адресу (заглушка для будущей интеграции)
 */
async function getLocationByIP(ipAddress: string): Promise<LocationInfo> {
  // В будущем здесь можно интегрировать сервис геолокации
  // Например: ipapi.co, ipgeolocation.io, или MaxMind GeoIP
  
  // Пока возвращаем базовую информацию
  if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.startsWith('192.168.')) {
    return {
      country: 'Kazakhstan',
      city: 'Almaty',
      region: 'Almaty Region',
      timezone: 'Asia/Almaty'
    };
  }
  
  return {
    timezone: 'Asia/Almaty'
  };
}

/**
 * Определяет подозрительность попытки входа
 */
function detectSuspiciousActivity(
  ipAddress: string,
  userAgent: string,
  email: string,
  success: boolean
): { isSuspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let isSuspicious = false;
  
  // Проверка на необычный User-Agent
  if (!userAgent || userAgent.length < 10) {
    isSuspicious = true;
    reasons.push('UNUSUAL_DEVICE');
  }
  
  // Проверка на локальные IP (в продакшене это может быть подозрительно)
  if (process.env.NODE_ENV === 'production' && 
      (ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.'))) {
    isSuspicious = true;
    reasons.push('UNUSUAL_LOCATION');
  }
  
  return { isSuspicious, reasons };
}

/**
 * Основная функция для логирования попытки входа
 */
export async function logLoginAttempt(
  req: NextApiRequest,
  data: LoginLogData
): Promise<void> {
  try {
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const deviceInfo = parseUserAgent(userAgent);
    const location = await getLocationByIP(ipAddress);
    
    const { isSuspicious, reasons } = detectSuspiciousActivity(
      ipAddress,
      userAgent,
      data.email,
      data.success
    );
    
    const loginAttempt = new LoginAttempt({
      userId: data.userId || null,
      email: data.email.toLowerCase(),
      success: data.success,
      failureReason: data.failureReason,
      ipAddress,
      userAgent,
      location,
      deviceInfo,
      loginMethod: data.loginMethod || 'EMAIL_PASSWORD',
      attemptedAt: new Date(),
      isSuspicious: isSuspicious,
      suspiciousReasons: reasons,
      metadata: {
        ...data.metadata,
        requestHeaders: {
          'accept-language': req.headers['accept-language'],
          'accept-encoding': req.headers['accept-encoding'],
          'connection': req.headers['connection']
        },
        serverInfo: {
          nodeEnv: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        }
      }
    });
    
    await loginAttempt.save();
    
    // Логируем в консоль для мониторинга
    const logLevel = data.success ? 'info' : 'warn';
    const logMessage = `[${logLevel.toUpperCase()}] Login attempt: ${data.email} from ${ipAddress} - ${data.success ? 'SUCCESS' : `FAILED (${data.failureReason})`}`;
    
    if (isSuspicious) {
      console.warn(`[SECURITY] Suspicious login attempt detected: ${logMessage}`);
    } else {
      console.log(logMessage);
    }
    
  } catch (error) {
    console.error('Ошибка при логировании попытки входа:', error);
    // Не прерываем основной процесс аутентификации из-за ошибки логирования
  }
}

/**
 * Логирование успешного входа
 */
export async function logSuccessfulLogin(
  req: NextApiRequest,
  userId: string,
  email: string,
  loginMethod: 'EMAIL_PASSWORD' | 'TOKEN_REFRESH' | 'ADMIN_LOGIN' = 'EMAIL_PASSWORD',
  metadata?: any
): Promise<void> {
  await logLoginAttempt(req, {
    userId,
    email,
    success: true,
    loginMethod,
    metadata
  });
}

/**
 * Логирование неудачного входа
 */
export async function logFailedLogin(
  req: NextApiRequest,
  email: string,
  failureReason: string,
  userId?: string,
  metadata?: any
): Promise<void> {
  await logLoginAttempt(req, {
    userId,
    email,
    success: false,
    failureReason,
    metadata
  });
}

/**
 * Получение статистики попыток входа для администратора
 */
export async function getLoginStatistics(days: number = 7) {
  try {
    const statistics = await LoginAttempt.getLoginStatistics(days);
    const suspiciousActivity = await LoginAttempt.getSuspiciousActivity(20);
    
    const totalAttempts = await LoginAttempt.countDocuments({
      attemptedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    });
    
    const successfulLogins = await LoginAttempt.countDocuments({
      success: true,
      attemptedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    });
    
    const failedLogins = totalAttempts - successfulLogins;
    const successRate = totalAttempts > 0 ? Math.round((successfulLogins / totalAttempts) * 100) : 0;
    
    return {
      period: `${days} дней`,
      totalAttempts,
      successfulLogins,
      failedLogins,
      successRate,
      dailyStatistics: statistics,
      suspiciousActivity: suspiciousActivity.map((attempt: any) => ({
        id: attempt._id,
        email: attempt.email,
        ipAddress: attempt.ipAddress,
        success: attempt.success,
        failureReason: attempt.failureReason,
        isSuspicious: attempt.isSuspicious,
        suspiciousReasons: attempt.suspiciousReasons,
        attemptedAt: attempt.attemptedAt,
        deviceInfo: attempt.deviceInfo,
        location: attempt.location,
        user: attempt.userId ? {
          id: attempt.userId._id,
          email: attempt.userId.email,
          name: `${attempt.userId.firstName} ${attempt.userId.lastName}`,
          role: attempt.userId.role
        } : null
      }))
    };
    
  } catch (error) {
    console.error('Ошибка получения статистики входов:', error);
    throw new Error('Не удалось получить статистику входов');
  }
}

/**
 * Проверка на превышение лимита попыток входа
 */
export async function checkRateLimit(
  email: string,
  ipAddress: string,
  timeWindow: number = 15, // минут
  maxAttempts: number = 5
): Promise<{ isLimited: boolean; remainingAttempts: number; resetTime?: Date }> {
  try {
    const since = new Date(Date.now() - timeWindow * 60 * 1000);
    
    // Проверяем попытки по email
    const emailAttempts = await LoginAttempt.countDocuments({
      email: email.toLowerCase(),
      success: false,
      attemptedAt: { $gte: since }
    });
    
    // Проверяем попытки по IP
    const ipAttempts = await LoginAttempt.countDocuments({
      ipAddress,
      success: false,
      attemptedAt: { $gte: since }
    });
    
    const maxAttemptsReached = emailAttempts >= maxAttempts || ipAttempts >= maxAttempts;
    
    if (maxAttemptsReached) {
      // Находим время последней неудачной попытки для расчета времени сброса
      const lastAttempt = await LoginAttempt.findOne({
        $or: [
          { email: email.toLowerCase() },
          { ipAddress }
        ],
        success: false,
        attemptedAt: { $gte: since }
      }).sort({ attemptedAt: -1 });
      
      const resetTime = lastAttempt 
        ? new Date(lastAttempt.attemptedAt.getTime() + timeWindow * 60 * 1000)
        : new Date(Date.now() + timeWindow * 60 * 1000);
      
      return {
        isLimited: true,
        remainingAttempts: 0,
        resetTime
      };
    }
    
    return {
      isLimited: false,
      remainingAttempts: maxAttempts - Math.max(emailAttempts, ipAttempts)
    };
    
  } catch (error) {
    console.error('Ошибка проверки лимита попыток:', error);
    // В случае ошибки разрешаем попытку, но логируем проблему
    return {
      isLimited: false,
      remainingAttempts: 1
    };
  }
}