import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../backend/lib/dbConnect';
import User from '../../../backend/models/User';
import { createApiError } from '../../../middleware/apiErrorHandler';

export async function POST(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Content-Type', 'application/json');
  
  console.log('Login attempt:', {
    method: req.method,
    hasBody: !!req.body,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    env: {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV
    }
  });

  const { email, password } = req.body;

  if (!email || !password) {
    throw createApiError('Email and password are required', 400);
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not found in environment');
    throw createApiError('Server configuration error', 500);
  }

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not found in environment');
    throw createApiError('Database configuration error', 500);
  }

  await dbConnect();

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw createApiError('Invalid credentials', 401);
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw createApiError('Invalid credentials', 401);
  }

  if (!['admin', 'Admin', 'student', 'Student', 'User'].includes(user.role)) {
    throw createApiError('Access denied. Invalid user role.', 403);
  }

  const token = jwt.sign(
    { 
      userId: user._id, 
      email: user.email, 
      role: user.role,
      hasStudentAccess: user.hasStudentAccess
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);

  let redirectTo = '/user-dashboard';
  if (user.role === 'Admin') {
    redirectTo = '/admin';
  } else if (user.hasStudentAccess) {
    redirectTo = '/dashboard';
  }

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      hasStudentAccess: user.hasStudentAccess
    },
    token,
    redirectTo
  });
}