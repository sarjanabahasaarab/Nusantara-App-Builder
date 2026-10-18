/**
 * Nusantara App Builder - Theme Zustand Store
 * Phase 10: Reactive theme switcher, CSS variables injection, and JSON import/export.
 */

import { create } from 'zustand';
import { ThemeDefinition } from '../types';
import { DEFAULT_THEMES, NUSANTARA_DARK_THEME } from '../tokens';

interface ThemeState {
  themes: ThemeDefinition[];
  activeThemeId: string;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;

  setActiveTheme: (id: string) => void;
  importThemeFromJson: (jsonStr: string) => { success: boolean; error?: string };
  exportThemeAsJson: (id: string) => string;
  getActiveTheme: () => ThemeDefinition;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themes: DEFAULT_THEMES,
  activeThemeId: 'nusantara-dark',
  isThemeModalOpen: false,
  setIsThemeModalOpen: (open) => set({ isThemeModalOpen: open }),

  getActiveTheme: () => {
    const { themes, activeThemeId } = get();
    return themes.find((t) => t.id === activeThemeId) || NUSANTARA_DARK_THEME;
  },

  setActiveTheme: (id) => {
    const theme = get().themes.find((t) => t.id === id);
    if (!theme) return;

    set({ activeThemeId: id });

    // Inject CSS variables into root element
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const c = theme.colors;
      root.style.setProperty('--nab-bg', c.background);
      root.style.setProperty('--nab-surface', c.surface);
      root.style.setProperty('--nab-surface-hover', c.surfaceHover);
      root.style.setProperty('--nab-border', c.border);
      root.style.setProperty('--nab-text-primary', c.textPrimary);
      root.style.setProperty('--nab-text-secondary', c.textSecondary);
      root.style.setProperty('--nab-accent', c.accent);
      root.style.setProperty('--nab-sidebar-bg', c.sidebarBg);
      root.style.setProperty('--nab-toolbar-bg', c.toolbarBg);
      root.style.setProperty('--nab-canvas-bg', c.canvasBg);
      root.style.setProperty('--nab-editor-bg', c.editorBg);

      if (id === 'nusantara-light') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        root.classList.remove('light');
        root.classList.add('dark');
      }
    }
  },

  importThemeFromJson: (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.name || !parsed.colors || !parsed.colors.background) {
        return { success: false, error: 'Invalid theme JSON structure. Missing name or colors.' };
      }

      const id = parsed.id || `custom-${Date.now()}`;
      const newTheme: ThemeDefinition = {
        ...parsed,
        id,
        version: parsed.version || '1.0.0',
        isBuiltin: false,
      };

      set((state) => ({
        themes: [...state.themes.filter((t) => t.id !== id), newTheme],
      }));

      get().setActiveTheme(id);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to parse theme JSON' };
    }
  },

  exportThemeAsJson: (id) => {
    const theme = get().themes.find((t) => t.id === id) || get().getActiveTheme();
    return JSON.stringify(theme, null, 2);
  },
}));
