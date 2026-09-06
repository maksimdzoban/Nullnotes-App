import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light' | 'oled' | 'sepia';
export type AccentColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';

interface ThemeState {
  theme: ThemeMode;
  accent: AccentColor;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
}

const getInitialTheme = (): ThemeMode => {
  const saved = localStorage.getItem('nullnotes_theme') as ThemeMode;
  if (['dark', 'light', 'oled', 'sepia'].includes(saved)) {
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  }
  document.documentElement.setAttribute('data-theme', 'dark');
  return 'dark';
};

const getInitialAccent = (): AccentColor => {
  const saved = localStorage.getItem('nullnotes_accent') as AccentColor;
  if (['indigo', 'emerald', 'amber', 'rose', 'sky'].includes(saved)) {
    document.documentElement.setAttribute('data-accent', saved);
    return saved;
  }
  document.documentElement.setAttribute('data-accent', 'indigo');
  return 'indigo';
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  accent: getInitialAccent(),
  isSettingsModalOpen: false,
  setIsSettingsModalOpen: (open: boolean) => set({ isSettingsModalOpen: open }),
  setTheme: (theme: ThemeMode) => {
    localStorage.setItem('nullnotes_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  setAccent: (accent: AccentColor) => {
    localStorage.setItem('nullnotes_accent', accent);
    document.documentElement.setAttribute('data-accent', accent);
    set({ accent });
  }
}));
