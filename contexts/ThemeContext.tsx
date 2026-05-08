'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Theme } from '@/lib/types'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  themes: { id: Theme; label: string; description: string; preview: string }[]
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const STORAGE_KEY = 'cemt_theme'

export const THEMES: { id: Theme; label: string; description: string; preview: string }[] = [
  {
    id: 'default',
    label: 'Cloudaeon Blue',
    description: 'Clean white with professional blue accents',
    preview: '#2563eb',
  },
  {
    id: 'dark',
    label: 'Dark Mode',
    description: 'Dark slate background with purple accents',
    preview: '#818cf8',
  },
  {
    id: 'ocean',
    label: 'Ocean Teal',
    description: 'Deep teal and navy blue tones',
    preview: '#0891b2',
  },
  {
    id: 'forest',
    label: 'Forest Green',
    description: 'Natural green and sage tones',
    preview: '#16a34a',
  },
  {
    id: 'sunset',
    label: 'Sunset Amber',
    description: 'Warm amber and orange tones',
    preview: '#d97706',
  },
  {
    id: 'lavender',
    label: 'Lavender',
    description: 'Soft purple and violet tones',
    preview: '#9333ea',
  },
]

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('default')

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme) || 'default'
    applyTheme(stored)
    setThemeState(stored)
  }, [])

  function applyTheme(t: Theme) {
    document.documentElement.setAttribute('data-theme', t)
  }

  function setTheme(t: Theme) {
    setThemeState(t)
    applyTheme(t)
    localStorage.setItem(STORAGE_KEY, t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
