import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'ar';

interface ThemeState {
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      language: 'en',
      sidebarCollapsed: false,

      setTheme: (theme: Theme) => {
        set({ theme });
        
        // Apply theme to document
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      },

      setLanguage: (language: Language) => {
        set({ language });
        document.documentElement.lang = language;
      },

      toggleSidebar: () => {
        set({ sidebarCollapsed: !get().sidebarCollapsed });
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.setTheme) {
          state.setTheme(state.theme);
        }
      },
    }
  )
);