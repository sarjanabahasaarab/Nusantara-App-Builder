/**
 * Nusantara App Builder - Settings Store
 * Zustand store with localStorage persistence and theme/language reactivity.
 */

import { create } from 'zustand';
import { AppSettings, ThemeMode, LanguageCode } from '../types/settings';

const STORAGE_KEY = 'nusantara_app_builder_settings';

const defaultSettings: AppSettings = {
  general: {
    defaultProjectsDirectory: 'C:\\Users\\Developer\\NusantaraProjects',
    autoSaveIntervalSeconds: 30,
    reopenLastProjectOnStartup: false,
    telemetryEnabled: false,
  },
  appearance: {
    theme: 'dark',
    accentColor: '#3b82f6',
    compactMode: false,
  },
  language: {
    current: 'id',
    fallback: 'en',
  },
  projectDefaults: {
    defaultPackagePrefix: 'com.nusantara',
    defaultTemplate: 'empty-android',
    defaultCompileSdk: 34,
    defaultMinSdk: 26,
  },
  toolchain: {
    androidSdkPath: 'C:\\Users\\Developer\\AppData\\Local\\Android\\Sdk',
    jdkPath: 'C:\\Program Files\\Java\\jdk-17',
    gradlePath: '',
    autoDetect: true,
  },
};

function loadStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return {
      ...defaultSettings,
      ...parsed,
      general: { ...defaultSettings.general, ...parsed.general },
      appearance: { ...defaultSettings.appearance, ...parsed.appearance },
      language: { ...defaultSettings.language, ...parsed.language },
      projectDefaults: { ...defaultSettings.projectDefaults, ...parsed.projectDefaults },
      toolchain: { ...defaultSettings.toolchain, ...parsed.toolchain },
    };
  } catch {
    return defaultSettings;
  }
}

function applyThemeToDocument(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

interface SettingsState {
  settings: AppSettings;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (lang: LanguageCode) => void;
  updateGeneralSettings: (general: Partial<AppSettings['general']>) => void;
  updateAppearanceSettings: (appearance: Partial<AppSettings['appearance']>) => void;
  updateProjectDefaults: (defaults: Partial<AppSettings['projectDefaults']>) => void;
  updateToolchainSettings: (toolchain: Partial<AppSettings['toolchain']>) => void;
  resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initial = loadStoredSettings();
  applyThemeToDocument(initial.appearance.theme);

  const persist = (updated: AppSettings) => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  return {
    settings: initial,

    setTheme: (theme: ThemeMode) => {
      const current = get().settings;
      const updated: AppSettings = {
        ...current,
        appearance: { ...current.appearance, theme },
      };
      applyThemeToDocument(theme);
      persist(updated);
      set({ settings: updated });
    },

    setLanguage: (currentLang: LanguageCode) => {
      const current = get().settings;
      const updated: AppSettings = {
        ...current,
        language: { ...current.language, current: currentLang },
      };
      persist(updated);
      set({ settings: updated });
    },

    updateGeneralSettings: (generalPartial) => {
      const current = get().settings;
      const updated: AppSettings = {
        ...current,
        general: { ...current.general, ...generalPartial },
      };
      persist(updated);
      set({ settings: updated });
    },

    updateAppearanceSettings: (appearancePartial) => {
      const current = get().settings;
      const updated: AppSettings = {
        ...current,
        appearance: { ...current.appearance, ...appearancePartial },
      };
      if (appearancePartial.theme) {
        applyThemeToDocument(appearancePartial.theme);
      }
      persist(updated);
      set({ settings: updated });
    },

    updateProjectDefaults: (defaultsPartial) => {
      const current = get().settings;
      const updated: AppSettings = {
        ...current,
        projectDefaults: { ...current.projectDefaults, ...defaultsPartial },
      };
      persist(updated);
      set({ settings: updated });
    },

    updateToolchainSettings: (toolchainPartial) => {
      const current = get().settings;
      const updated: AppSettings = {
        ...current,
        toolchain: { ...current.toolchain, ...toolchainPartial },
      };
      persist(updated);
      set({ settings: updated });
    },

    resetToDefaults: () => {
      applyThemeToDocument(defaultSettings.appearance.theme);
      persist(defaultSettings);
      set({ settings: defaultSettings });
    },
  };
});
