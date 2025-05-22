import { createTamagui } from '@tamagui/core'
import { config } from '@tamagui/config/v3'

// Custom theme colors for HojaTTop
const customTokens = {
  color: {
    // Primary colors - teal/turquoise theme
    primary: '#4ECDC4',
    primaryDark: '#26A69A',
    primaryLight: '#80CBC4',
    
    // Accent colors
    accent: '#FF6B6B',
    accentDark: '#E53935',
    accentLight: '#FFCDD2',
    
    // Success/rating colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    
    // Neutral colors
    background: '#FFFFFF',
    backgroundDark: '#121212',
    surface: '#F5F5F5',
    surfaceDark: '#1E1E1E',
    
    // Text colors
    textPrimary: '#212121',
    textSecondary: '#757575',
    textPrimaryDark: '#FFFFFF',
    textSecondaryDark: '#B3B3B3',
    
    // Map specific colors
    mapBackground: '#E8F5E8',
    toiletMarker: '#4ECDC4',
    currentLocation: '#FF6B6B',
  }
}

// Light theme
const lightTheme = {
  background: customTokens.color.background,
  backgroundHover: customTokens.color.surface,
  backgroundPress: customTokens.color.surface,
  backgroundFocus: customTokens.color.surface,
  color: customTokens.color.textPrimary,
  colorHover: customTokens.color.textPrimary,
  colorPress: customTokens.color.textPrimary,
  colorFocus: customTokens.color.textPrimary,
  borderColor: '#E0E0E0',
  borderColorHover: customTokens.color.primary,
  primary: customTokens.color.primary,
  secondary: customTokens.color.accent,
}

// Dark theme
const darkTheme = {
  background: customTokens.color.backgroundDark,
  backgroundHover: customTokens.color.surfaceDark,
  backgroundPress: customTokens.color.surfaceDark,
  backgroundFocus: customTokens.color.surfaceDark,
  color: customTokens.color.textPrimaryDark,
  colorHover: customTokens.color.textPrimaryDark,
  colorPress: customTokens.color.textPrimaryDark,
  colorFocus: customTokens.color.textPrimaryDark,
  borderColor: '#333333',
  borderColorHover: customTokens.color.primaryLight,
  primary: customTokens.color.primaryLight,
  secondary: customTokens.color.accentLight,
}

export const tamaguiConfig = createTamagui({
  ...config,
  tokens: {
    ...config.tokens,
    color: {
      ...config.tokens.color,
      ...customTokens.color,
    },
  },
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      ...lightTheme,
    },
    dark: {
      ...config.themes.dark,
      ...darkTheme,
    },
  },
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}