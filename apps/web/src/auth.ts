import '@/auth.types';
import NextAuth, { type User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import MicrosoftEntraIDProvider from 'next-auth/providers/microsoft-entra-id';
import LinkedInProvider from 'next-auth/providers/linkedin';
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { logLogin } from './lib/login-logger';
import { trackSession, isSessionValid } from './lib/session-tracker';
import { authLogger } from './lib/logger';

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
    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email ?? undefined,
          image: profile.avatar_url,
        };
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Microsoft Entra ID (Azure AD) Provider
    MicrosoftEntraIDProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || 'common'}/v2.0`,
    }),

    // LinkedIn OAuth Provider (uses OpenID Connect)
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),

    // Credentials Provider (Email/Password)
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
          // Debug: Log that authorize was called (will show in Axiom)
          authLogger.debug({ hasCredentials: !!credentials, credentialKeys: credentials ? Object.keys(credentials) : [] }, 'Authorize called');

          // Validate input
          const validatedCredentials = signInSchema.parse(credentials);
          userEmail = validatedCredentials.email;

          authLogger.debug({ email: userEmail }, 'Credentials validated, looking up user');

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
          if (user.status === 'pending') {
            // Log failed login attempt - email not verified
            await logLogin({
              userId: user.id,
              email: userEmail,
              success: false,
              failureReason: 'Email not verified',
              userName: user.name,
            }).catch((err) => console.error('Failed to log login:', err));
            throw new Error('EMAIL_NOT_VERIFIED');
          }

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

          // Track session and get session ID
          let sessionId: string | undefined;
          try {
            sessionId = await trackSession(user.id);
          } catch (err) {
            console.error('Failed to track session:', err);
          }

          // Return user object matching User type with session ID
          const returnUser: User = {
            id: user.id,
            email: user.email || undefined,
            name: user.name || undefined,
            image: user.avatar || undefined,
            sessionId, // Add session ID to user object
          };

          return returnUser;
        } catch (error) {
          // Log error details for debugging
          authLogger.error(
            {
              err: error,
              userEmail: userEmail || 'not-set',
              userId: userId || 'not-set',
              isZodError: error instanceof z.ZodError,
            },
            'Authorization error'
          );

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
    async signIn({ user, account, profile: _profile }) {
      // For OAuth providers, ensure user exists in database
      if (account && account.provider !== 'credentials') {
        try {
          // Check if user exists
          let dbUser = await prisma.users.findUnique({
            where: { email: user.email! },
          });

          // Create user if doesn't exist
          if (!dbUser) {
            dbUser = await prisma.users.create({
              data: {
                email: user.email!,
                name: user.name,
                avatar: user.image,
                emailVerified: new Date(),
                locale: 'en',
                timezone: 'UTC',
                status: 'active',
                updatedAt: new Date(),
              },
            });
            console.log(`Created new OAuth user: ${user.email}`);
          }

          // Create or update account link
          const existingAccount = await prisma.accounts.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          });

          if (!existingAccount) {
            await prisma.accounts.create({
              data: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: typeof account.session_state === 'string' ? account.session_state : null,
              },
            });
          }

          // Log successful OAuth login
          await logLogin({
            userId: dbUser.id,
            email: user.email!,
            success: true,
            userName: user.name,
          }).catch((err) => console.error('Failed to log OAuth login:', err));

          // Track session for OAuth users
          const sessionId = await trackSession(dbUser.id);
          user.sessionId = sessionId;
          user.id = dbUser.id;

          return true;
        } catch (error) {
          console.error('OAuth sign-in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.sessionId = user.sessionId; // Store session ID in JWT
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

      // Validate session on every request (except during sign in)
      // Only validate once per minute to avoid excessive DB calls
      if (trigger !== 'signIn' && token.sessionId && typeof token.sessionId === 'string') {
        const now = Date.now();
        const lastCheck = (token.lastSessionCheck as number) || 0;
        const shouldCheck = now - lastCheck > 60000; // Check every 60 seconds

        if (shouldCheck) {
          const sessionValid = await isSessionValid(token.sessionId);
          token.lastSessionCheck = now;

          if (!sessionValid) {
            // Mark session as invalid instead of returning null
            console.log(`Session ${token.sessionId} is no longer valid`);
            token.sessionInvalid = true;
          } else {
            token.sessionInvalid = false;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.locale = token.locale as string;
        session.user.timezone = token.timezone as string;
        session.user.sessionId = token.sessionId as string | undefined;
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
  trustHost: true, // Required for devcontainers and proxied environments
  logger: {
    error(code, ...message) {
      // CredentialsSignin is expected for failed login attempts - log as warning
      // Check multiple properties as the error object structure varies between dev and production
      const isCredentialsSignin = code.name === 'CredentialsSignin' || (code as { type?: string }).type === 'CredentialsSignin' || code.message?.includes('CredentialsSignin');

      if (isCredentialsSignin) {
        authLogger.warn({ code: 'CredentialsSignin' }, 'Failed login attempt');
      } else {
        authLogger.error({ err: code, details: message }, 'Auth error');
      }
    },
    warn(code) {
      authLogger.warn({ code }, 'Auth warning');
    },
    debug(code, ...message) {
      authLogger.debug({ code, details: message }, 'Auth debug');
    },
  },
});
