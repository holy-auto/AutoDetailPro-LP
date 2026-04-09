import { createContext, useContext, useState, useEffect, useMemo, useCallback, createElement } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';

// =============================================
// Dark Mode Theme System
// =============================================
// Provides DarkColors, ThemeContext, ThemeProvider, and useTheme hook.
// Persists user preference via AsyncStorage.

const STORAGE_KEY = 'theme_preference';

// --- Dark Colors ---

export const DarkColors = {
  // Blue palette (adjusted for dark)
  primary: '#60A5FA',
  primaryLight: '#3B82F6',
  primaryMedium: '#2B5797',
  primarySoft: '#1E3A5F',
  primaryPale: '#1E293B',
  primaryFaint: '#0F172A',

  // Base
  white: '#0F172A',
  offWhite: '#0F172A',
  background: '#0F172A',
  card: '#1E293B',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textOnPrimary: '#FFFFFF',

  // Accent
  gold: '#D4A574',
  goldLight: '#B8956A',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#60A5FA',

  // Borders & Shadows
  border: '#334155',
  borderLight: '#1E293B',
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

// --- Type for Colors ---

export type ThemeColors = typeof Colors;

// --- getThemeColors ---

/**
 * Return the light or dark color palette based on boolean flag.
 */
export function getThemeColors(isDark: boolean): ThemeColors {
  return isDark ? (DarkColors as unknown as ThemeColors) : Colors;
}

// --- Theme Context ---

type ThemeContextValue = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
};

export const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
  colors: Colors,
});

// --- ThemeProvider ---

/**
 * Wraps children with ThemeContext.Provider.
 * Loads persisted preference from AsyncStorage on mount.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'dark') {
          setIsDark(true);
        }
      } catch {
        // Silently fall back to light theme
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light').catch(
        () => {},
      );
      return next;
    });
  }, []);

  // Memoize context value to prevent unnecessary consumer re-renders
  const contextValue = useMemo(
    () => ({ isDark, toggleTheme, colors: getThemeColors(isDark) }),
    [isDark, toggleTheme],
  );

  return createElement(
    ThemeContext.Provider,
    { value: contextValue },
    children,
  );
}

// --- useTheme Hook ---

/**
 * Returns the current theme context: { isDark, toggleTheme, colors }.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
