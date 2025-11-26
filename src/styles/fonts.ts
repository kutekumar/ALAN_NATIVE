import { Platform } from 'react-native';

export const FontFamily = {
  primary: Platform.select({
    ios: 'Suranna_400Regular',
    android: 'Suranna_400Regular',
    default: 'Suranna_400Regular',
  }),
  primaryBold: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }),
};

export const getFontFamily = (weight?: 'normal' | 'bold') => {
  if (weight === 'bold') {
    return FontFamily.primaryBold;
  }
  return FontFamily.primary;
};

// Text style presets with Suranna font
export const textStyles = {
  // Main App Title (ALAN LUX)
  appTitle: {
    fontFamily: FontFamily.primaryBold,
    fontSize: 36,
    fontWeight: '900' as const,
    letterSpacing: 4,
  },
  // App Subtitle (Premium Dining Experience)
  appSubtitle: {
    fontFamily: FontFamily.primary,
    fontSize: 18,
    fontWeight: '400' as const,
    letterSpacing: 1.5,
  },
  // Page Headlines
  heading1: {
    fontFamily: FontFamily.primaryBold,
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  heading2: {
    fontFamily: FontFamily.primaryBold,
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
  },
  heading3: {
    fontFamily: FontFamily.primaryBold,
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: 0.6,
  },
  heading4: {
    fontFamily: FontFamily.primary,
    fontSize: 20,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
  },
  // Onboarding titles
  onboardingTitle: {
    fontFamily: FontFamily.primaryBold,
    fontSize: 30,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
  },
  onboardingSubtitle: {
    fontFamily: FontFamily.primary,
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  // Body text
  bodyLarge: {
    fontFamily: FontFamily.primary,
    fontSize: 18,
    fontWeight: '400' as const,
    letterSpacing: 0.3,
  },
  body: {
    fontFamily: FontFamily.primary,
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
  },
  bodySmall: {
    fontFamily: FontFamily.primary,
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: FontFamily.primary,
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
  },
  // Input and form text
  inputText: {
    fontFamily: FontFamily.primary,
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.3,
  },
  label: {
    fontFamily: FontFamily.primaryBold,
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
  },
  // Button text
  buttonText: {
    fontFamily: FontFamily.primaryBold,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
  },
  // Tab button text (Sign In / Sign Up tabs)
  tabButtonText: {
    fontFamily: FontFamily.primaryBold,
    fontSize: 15,
    fontWeight: '800' as const,
    letterSpacing: 1.5,
  },
  // Auth page titles (Welcome Back, Create Account)
  authTitle: {
    fontFamily: FontFamily.primaryBold,
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: 1.5,
  },
};