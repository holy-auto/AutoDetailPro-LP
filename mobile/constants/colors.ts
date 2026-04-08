export const Colors = {
  // Forest Green palette
  primary: '#1B4332',
  primaryLight: '#2D6A4F',
  primaryMedium: '#40916C',
  primarySoft: '#52B788',
  primaryPale: '#B7E4C7',
  primaryFaint: '#D8F3DC',

  // Base
  white: '#FFFFFF',
  offWhite: '#F8FAF9',
  background: '#FAFCFB',
  card: '#FFFFFF',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#4A5568',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',

  // Accent
  gold: '#D4A574',
  goldLight: '#E8C9A0',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Borders & Shadows
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  shadow: 'rgba(27, 67, 50, 0.08)',
  shadowDark: 'rgba(27, 67, 50, 0.16)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  xxxl: 34,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
