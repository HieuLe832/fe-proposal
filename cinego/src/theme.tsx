import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeId =
  | 'orig-dark'
  | 'orig-light'
  | 'orig-beige'
  | 'edit-dark'
  | 'edit-noir'
  | 'edit-amber'
  | 'edit-teal'
  | 'edit-gold'
  | 'edit-neon'
  | 'edit-light'
  | 'edit-beige'

export const THEMES: { id: ThemeId; label: string; version: string; swatch: string[] }[] = [
  { id: 'orig-dark', label: 'Dark', version: 'Gốc', swatch: ['#0f1220', '#232940', '#e50914'] },
  { id: 'orig-light', label: 'Light', version: 'Gốc', swatch: ['#f7f8fb', '#e6eaf3', '#e50914'] },
  { id: 'orig-beige', label: 'Beige', version: 'Gốc', swatch: ['#f5efe4', '#ebe2d1', '#e50914'] },
  { id: 'edit-dark', label: 'Dark', version: 'Chỉnh sửa', swatch: ['#222831', '#393e46', '#d13a3a'] },
  { id: 'edit-noir', label: 'Noir', version: 'Chỉnh sửa', swatch: ['#1a1a1d', '#4e4e50', '#c3073f'] },
  { id: 'edit-amber', label: 'Amber', version: 'Chỉnh sửa', swatch: ['#07090f', '#14213d', '#fca311'] },
  { id: 'edit-teal', label: 'Teal', version: 'Chỉnh sửa', swatch: ['#161a20', '#2b313b', '#76abae'] },
  { id: 'edit-gold', label: 'Gold', version: 'Chỉnh sửa', swatch: ['#0a0a0a', '#242424', '#c9a227'] },
  { id: 'edit-neon', label: 'Neon', version: 'Chỉnh sửa', swatch: ['#14161c', '#252a34', '#e0194f'] },
  { id: 'edit-light', label: 'Light', version: 'Chỉnh sửa', swatch: ['#f7f4f3', '#efe8e6', '#c73232'] },
  { id: 'edit-beige', label: 'Beige', version: 'Chỉnh sửa', swatch: ['#f5efe4', '#ebe2d1', '#c73232'] },
]

const STORAGE_KEY = 'cinego-theme'

function readStored(): ThemeId {
  try {
    // `?theme=edit-dark` lets a mode be linked directly.
    const v = new URLSearchParams(location.search).get('theme') ?? localStorage.getItem(STORAGE_KEY)
    if (THEMES.some((t) => t.id === v)) return v as ThemeId
  } catch {
    /* storage unavailable */
  }
  return 'orig-dark'
}

const ThemeContext = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void }>({
  theme: 'orig-dark',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(readStored)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage unavailable */
    }
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext)
