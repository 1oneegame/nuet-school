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
    await dbConnect();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user has valid role (admin, Student, or User)
    if (!['admin', 'Admin', 'student', 'Student', 'User'].includes(user.role)) {
      return res.status(403).json({ message: 'Access denied. Invalid user role.' });
    }

    // Email verification removed - all users can login after registration

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        hasStudentAccess: user.hasStudentAccess
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Set cookie
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`);

    // Determine redirect path based on user role and access
    let redirectTo = '/user-dashboard'; // Default for User role without student access
    if (user.role === 'Admin') {
      redirectTo = '/admin';
    } else if (user.hasStudentAccess) {
      redirectTo = '/dashboard'; // Student dashboard for users with access
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

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}