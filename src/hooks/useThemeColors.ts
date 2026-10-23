import type { ThemeMode } from '../types'
import { useApp } from './useApp'

export interface ThemeColors {
  accent: string
  secondary: string
  text: string
  muted: string
  border: string
  surface: string
}

/** Mirrors the tokens in index.css — recharts needs concrete colors for SVG attributes. */
const COLORS: Record<ThemeMode, ThemeColors> = {
  dark: {
    accent: '#ff8a4c',
    secondary: '#6fd8c1',
    text: '#f8f1ea',
    muted: '#bcb0c9',
    border: '#3d3350',
    surface: '#211a2b',
  },
  light: {
    accent: '#c2440f',
    secondary: '#0d7a68',
    text: '#2a1d2c',
    muted: '#665767',
    border: '#eddccc',
    surface: '#ffffff',
  },
}

export function useThemeColors(): ThemeColors {
  return COLORS[useApp().settings.theme]
}
