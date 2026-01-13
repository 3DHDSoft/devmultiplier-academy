'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UserProfileContextType {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  userName: string | null;
  setUserName: (name: string | null) => void;
  refreshProfile: () => Promise<void>;
}

const UserAvatarContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserAvatarProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (status === 'authenticated' && session?.user?.email) {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setAvatarUrl(data.avatar || null);
          setUserName(data.name || null);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    }
  }, [session?.user?.email, status]);

  // Fetch profile when session changes
  useEffect(() => {
    if (status === 'authenticated') {
      // Defer to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        refreshProfile();
      });
    } else {
      requestAnimationFrame(() => {
        setAvatarUrl(null);
        setUserName(null);
      });
    }
  }, [status, refreshProfile]);

  return (
    <UserAvatarContext.Provider value={{ avatarUrl, setAvatarUrl, userName, setUserName, refreshProfile }}>
      {children}
    </UserAvatarContext.Provider>
  );
}

export function useUserAvatar() {
  const context = useContext(UserAvatarContext);
  if (context === undefined) {
    throw new Error('useUserAvatar must be used within a UserAvatarProvider');
  }
  return context;
}
