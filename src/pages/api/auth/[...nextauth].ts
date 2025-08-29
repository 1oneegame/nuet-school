import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
// В будущем здесь будет импорт моделей пользователей из базы данных
// import User from '@/backend/models/User';

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

        // Здесь будет проверка пользователя в базе данных
        // Временная заглушка для демонстрации
        const mockUsers = [
          {
            id: '1',
            name: 'Тестовый пользователь',
            email: 'test@example.com',
            password: bcrypt.hashSync('password123', 10),
            role: 'user'
          },
          {
            id: '2',
            name: 'Администратор',
            email: 'admin@example.com',
            password: bcrypt.hashSync('admin123', 10),
            role: 'admin'
          }
        ];

        const user = mockUsers.find(user => user.email === credentials.email);

        if (!user) {
          throw new Error('Пользователь не найден');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Неверный пароль');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
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
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
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