export const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#f093fb',
  background: '#f7fafc',
  surface: '#ffffff',
  white: '#ffffff',
  black: '#000000',
  text: '#2d3748',
  textSecondary: '#718096',
  success: '#48bb78',
  warning: '#ed8936',
  error: '#f56565',
  border: '#e2e8f0',
  gradient: ['#667eea', '#764ba2'] as const,
  gradientAccent: ['#f093fb', '#f5576c'] as const,
  gray: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  h1: 30,
  h2: 22,
  h3: 16,
  body1: 14,
  body2: 12,
  caption: 10,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 30,
  },
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
  },
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 10,
  },
};
