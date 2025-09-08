import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import dbConnect from '../../../backend/lib/dbConnect';
import User from '../../../backend/models/User';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Необходимо указать email и пароль');
        }
        await dbConnect();
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');
        if (!user) {
          throw new Error('Пользователь не найден');
        }
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) {
          throw new Error('Неверный пароль');
        }
        if (!['Admin', 'Student', 'User'].includes(user.role)) {
          throw new Error('Доступ запрещён');
        }
        return {
          id: String(user._id),
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          role: user.role,
          hasStudentAccess: user.hasStudentAccess
        } as any;
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role as any;
        (token as any).hasStudentAccess = (user as any).hasStudentAccess as any;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        (session.user as any).id = (token as any).id as any;
        (session.user as any).role = (token as any).role as any;
        (session.user as any).hasStudentAccess = (token as any).hasStudentAccess as any;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-for-development',
};

export default NextAuth(authOptions);