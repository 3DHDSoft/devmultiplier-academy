'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

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

    let resolvedTheme: 'light' | 'dark' = 'light';

    if (theme === 'system') {
      // Detect system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolvedTheme = systemPrefersDark ? 'dark' : 'light';
    } else {
      resolvedTheme = theme;
    }

    setEffectiveTheme(resolvedTheme);

    // Remove both classes first
    root.classList.remove('light', 'dark');
    // Add the resolved theme class
    root.classList.add(resolvedTheme);

    // Also set data attribute for CSS
    root.setAttribute('data-theme', resolvedTheme);
  }, [theme]);

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      const newTheme = e.matches ? 'dark' : 'light';
      setEffectiveTheme(newTheme);
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      root.setAttribute('data-theme', newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

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

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
