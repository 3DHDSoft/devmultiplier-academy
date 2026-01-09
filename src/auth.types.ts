import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email?: string;
    name?: string | null;
    image?: string | null;
    sessionId?: string;
  }

  interface Session {
    user: User & {
      id: string;
      locale: string;
      timezone: string;
      sessionId?: string;
    };
  }
}
