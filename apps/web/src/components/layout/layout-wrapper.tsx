'use client';

import { SessionProvider } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserAvatarProvider } from '@/contexts/UserAvatarContext';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <UserAvatarProvider>
          <Header />
          {children}
          <Footer />
        </UserAvatarProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
