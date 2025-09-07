import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../backend/lib/dbConnect';
import User from '../../../backend/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        decoded = jwt.decode(token);
        if (!decoded || !decoded.userId) {
          return res.status(401).json({ message: 'Invalid token' });
        }
      } else {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!['admin', 'Admin', 'student', 'Student', 'User'].includes(user.role)) {
      return res.status(403).json({ message: 'Access denied. Invalid user role.' });
    }

    const newToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        hasStudentAccess: user.hasStudentAccess
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.setHeader('Set-Cookie', `token=${newToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);

    res.status(200).json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hasStudentAccess: user.hasStudentAccess
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
