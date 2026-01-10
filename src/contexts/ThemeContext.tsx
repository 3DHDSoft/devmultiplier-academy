'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [theme, setThemeState] = useState<Theme>('light');
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Derive effectiveTheme from theme and system preference
  const effectiveTheme = useMemo<'light' | 'dark'>(() => {
    if (theme === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return theme;
  }, [theme, systemPrefersDark]);

  // Get user's theme preference from session
  useEffect(() => {
    if (session?.user) {
      // Fetch user profile to get dashboardAppearance
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.dashboardAppearance) {
            setThemeState(data.dashboardAppearance as Theme);
          }
        })
        .catch((err) => console.error('Failed to fetch theme preference:', err));
    }
  }, [session]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove both classes first
    root.classList.remove('light', 'dark');
    // Add the resolved theme class
    root.classList.add(effectiveTheme);

    // Also set data attribute for CSS
    root.setAttribute('data-theme', effectiveTheme);
  }, [effectiveTheme]);

  // Listen for system theme changes and initialize system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Initialize on mount - using callback to avoid synchronous setState warning
    const initializeSystemPreference = () => {
      setSystemPrefersDark(mediaQuery.matches);
    };
    // Use requestAnimationFrame to defer the state update
    requestAnimationFrame(initializeSystemPreference);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);

    // Update user preference in database
    if (session?.user) {
      try {
        await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dashboardAppearance: newTheme,
          }),
        });
      } catch (err) {
        console.error('Failed to save theme preference:', err);
      }
    }
  };

  return <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
