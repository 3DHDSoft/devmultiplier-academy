import '@/auth.types';
import NextAuth, { type User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { logLogin } from './lib/login-logger';

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set. Run: openssl rand -base64 32');
}

// Zod schema for email/password validation
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        let userEmail = '';
        let userId = '';

        try {
          // Validate input
          const validatedCredentials = signInSchema.parse(credentials);
          userEmail = validatedCredentials.email;

          // Find user in database
          const user = await prisma.users.findUnique({
            where: { email: validatedCredentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              avatar: true,
              locale: true,
              timezone: true,
              status: true,
            },
          });

          // User not found
          if (!user) {
            // Log failed login attempt
            await logLogin({
              userId: 'unknown',
              email: userEmail,
              success: false,
              failureReason: 'User not found',
              userName: null,
            }).catch((err) => console.error('Failed to log login:', err));
            return null;
          }

          userId = user.id;

          // Check account status
          if (user.status !== 'active') {
            // Log failed login attempt
            await logLogin({
              userId: user.id,
              email: userEmail,
              success: false,
              failureReason: 'Account is not active',
              userName: user.name,
            }).catch((err) => console.error('Failed to log login:', err));
            throw new Error('Account is not active');
          }

          // Verify password
          if (!user.password) {
            // Log failed login attempt
            await logLogin({
              userId: user.id,
              email: userEmail,
              success: false,
              failureReason: 'Password not set',
              userName: user.name,
            }).catch((err) => console.error('Failed to log login:', err));
            throw new Error('Password not set for this account');
          }

          const isPasswordValid = await bcrypt.compare(validatedCredentials.password, user.password);

          if (!isPasswordValid) {
            // Log failed login attempt
            await logLogin({
              userId: user.id,
              email: userEmail,
              success: false,
              failureReason: 'Invalid password',
              userName: user.name,
            }).catch((err) => console.error('Failed to log login:', err));
            return null;
          }

          // Log successful login
          await logLogin({
            userId: user.id,
            email: userEmail,
            success: true,
            userName: user.name,
          }).catch((err) => console.error('Failed to log login:', err));

          // Return user object matching User type
          const returnUser: User = {
            id: user.id,
            email: user.email || undefined,
            name: user.name || undefined,
            image: user.avatar || undefined,
          };

          return returnUser;
        } catch (error) {
          // Log error if we have user info
          if (userId && userEmail) {
            await logLogin({
              userId,
              email: userEmail,
              success: false,
              failureReason: error instanceof Error ? error.message : 'Unknown error',
              userName: null,
            }).catch((err) => console.error('Failed to log login:', err));
          }
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Get locale and timezone from database
        const dbUser = await prisma.users.findUnique({
          where: { id: user.id },
          select: { locale: true, timezone: true },
        });
        if (dbUser) {
          token.locale = dbUser.locale;
          token.timezone = dbUser.timezone;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.locale = token.locale as string;
        session.user.timezone = token.timezone as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`New user registered: ${user.email}`);
      } else {
        console.log(`User signed in: ${user.email}`);
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
});
