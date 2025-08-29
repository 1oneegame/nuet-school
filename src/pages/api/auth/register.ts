import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../backend/lib/dbConnect';
import User from '../../../backend/models/User';
// Email verification removed - keeping registration simple

// Утилита для валидации WhatsApp номера
const validateWhatsAppNumber = (number: string): boolean => {
  // Удаляем все пробелы и специальные символы кроме +
  const cleanNumber = number.replace(/[^\d+]/g, '');
  
  // Проверяем формат: должен начинаться с + и содержать от 10 до 15 цифр
  const whatsappRegex = /^\+?[1-9]\d{9,14}$/;
  return whatsappRegex.test(cleanNumber);
};



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    await dbConnect();

    const { email, password, confirmPassword, firstName, lastName, whatsappNumber } = req.body;

    // Валидация входных данных
    if (!email || !password || !confirmPassword || !firstName || !lastName || !whatsappNumber) {
      return res.status(400).json({ 
        message: 'Все поля обязательны для заполнения' 
      });
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: 'Пароли не совпадают' 
      });
    }

    // Валидация пароля
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Пароль должен содержать минимум 6 символов' 
      });
    }

    // Валидация WhatsApp номера
    if (!validateWhatsAppNumber(whatsappNumber)) {
      return res.status(400).json({ 
        message: 'Некорректный формат WhatsApp номера. Используйте формат: +7XXXXXXXXXX' 
      });
    }

    // Нормализация WhatsApp номера
    const normalizedWhatsApp = whatsappNumber.replace(/[^\d+]/g, '');
    if (!normalizedWhatsApp.startsWith('+')) {
      return res.status(400).json({ 
        message: 'WhatsApp номер должен начинаться с кода страны (например: +7)' 
      });
    }

    // Проверка существования пользователя
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { whatsappNumber: normalizedWhatsApp }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ 
          message: 'Пользователь с таким email уже существует' 
        });
      }
      if (existingUser.whatsappNumber === normalizedWhatsApp) {
        return res.status(400).json({ 
          message: 'Пользователь с таким WhatsApp номером уже существует' 
        });
      }
    }

    // Создание нового пользователя (без email верификации)
    const newUser = new User({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      whatsappNumber: normalizedWhatsApp,
      isEmailVerified: true, // Автоматически подтверждаем email
      role: 'User',
      hasStudentAccess: false
    });

    await newUser.save();

    // Логирование регистрации
    console.log(`Новая регистрация: ${email} (${normalizedWhatsApp}) в ${new Date().toISOString()}`);

    res.status(201).json({
      message: 'Регистрация успешна! Теперь вы можете войти в систему.',
      userId: newUser._id,
      requiresVerification: false
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    
    if ((error as any).code === 11000) {
      // Ошибка дублирования в MongoDB
      const field = Object.keys((error as any).keyPattern)[0];
      const message = field === 'email' 
        ? 'Пользователь с таким email уже существует'
        : 'Пользователь с таким WhatsApp номером уже существует';
      
      return res.status(400).json({ message });
    }

    res.status(500).json({ 
      message: 'Внутренняя ошибка сервера. Попробуйте позже.' 
    });
  }
}