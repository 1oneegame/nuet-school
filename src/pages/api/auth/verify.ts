import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAdminAuth } from '../../../middleware/auth';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    // Если middleware прошел успешно, значит токен валиден и пользователь - администратор
    return res.status(200).json({
      success: true,
      message: 'Токен действителен',
      user: req.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка верификации токена'
    });
  }
};

export default withAdminAuth(handler);