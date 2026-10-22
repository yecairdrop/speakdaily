import type { ThemeMode } from '../types'
import { useApp } from './useApp'

export interface ThemeColors {
  accent: string
  text: string
  muted: string
  border: string
  surface: string
  success: string
}

/** Mirrors the tokens in index.css — recharts needs concrete colors for SVG attributes. */
const COLORS: Record<ThemeMode, ThemeColors> = {
  dark: {
    accent: '#818cf8',
    text: '#e6e8ee',
    muted: '#9aa1b2',
    border: '#2a2f3d',
    surface: '#171a23',
    success: '#34d399',
  },
  light: {
    accent: '#4f46e5',
    text: '#171a23',
    muted: '#5b6275',
    border: '#dde1ea',
    surface: '#ffffff',
    success: '#059669',
  },
}

export function useThemeColors(): ThemeColors {
  return COLORS[useApp().settings.theme]
}
