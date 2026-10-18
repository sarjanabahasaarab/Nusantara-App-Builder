/**
 * Nusantara App Builder - Standard Theme Tokens
 * Phase 10: Official predefined themes adhering to design token specifications.
 */

import { ThemeDefinition } from './types';

export const NUSANTARA_DARK_THEME: ThemeDefinition = {
  id: 'nusantara-dark',
  name: 'Nusantara Dark',
  version: '1.0.0',
  isBuiltin: true,
  colors: {
    background: '#09090b',
    surface: '#18181b',
    surfaceHover: '#27272a',
    border: '#27272a',
    borderFocus: '#3b82f6',
    textPrimary: '#f4f4f5',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    accent: '#2563eb',
    accentHover: '#1d4ed8',
    accentText: '#ffffff',
    sidebarBg: '#18181b',
    toolbarBg: '#18181b',
    canvasBg: '#09090b',
    editorBg: '#18181b',
  },
  typography: {
    fontFamilySans: 'Plus Jakarta Sans, sans-serif',
    fontFamilyMono: 'JetBrains Mono, monospace',
    baseSize: '14px',
    headingWeight: '700',
  },
  spacing: {
    unit: 4,
    borderRadiusBase: '8px',
    borderRadiusLg: '12px',
    sidebarWidth: '240px',
  },
  components: {
    buttonRadius: '8px',
    cardShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    designerGridVisible: true,
    designerGridColor: '#27272a',
    editorLineNumbers: true,
  },
};

export const NUSANTARA_LIGHT_THEME: ThemeDefinition = {
  id: 'nusantara-light',
  name: 'Nusantara Light',
  version: '1.0.0',
  isBuiltin: true,
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceHover: '#f1f5f9',
    border: '#e2e8f0',
    borderFocus: '#2563eb',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    accent: '#2563eb',
    accentHover: '#1d4ed8',
    accentText: '#ffffff',
    sidebarBg: '#f1f5f9',
    toolbarBg: '#ffffff',
    canvasBg: '#f8fafc',
    editorBg: '#ffffff',
  },
  typography: {
    fontFamilySans: 'Plus Jakarta Sans, sans-serif',
    fontFamilyMono: 'JetBrains Mono, monospace',
    baseSize: '14px',
    headingWeight: '700',
  },
  spacing: {
    unit: 4,
    borderRadiusBase: '8px',
    borderRadiusLg: '12px',
    sidebarWidth: '240px',
  },
  components: {
    buttonRadius: '8px',
    cardShadow: '0 2px 4px 0 rgb(0 0 0 / 0.05)',
    designerGridVisible: true,
    designerGridColor: '#e2e8f0',
    editorLineNumbers: true,
  },
};

export const NUSANTARA_EMERALD_THEME: ThemeDefinition = {
  id: 'nusantara-emerald',
  name: 'Nusantara Emerald (Forest)',
  version: '1.0.0',
  isBuiltin: true,
  colors: {
    background: '#022c22',
    surface: '#064e3b',
    surfaceHover: '#065f46',
    border: '#047857',
    borderFocus: '#10b981',
    textPrimary: '#ecfdf5',
    textSecondary: '#a7f3d0',
    textMuted: '#6ee7b7',
    accent: '#059669',
    accentHover: '#047857',
    accentText: '#ffffff',
    sidebarBg: '#064e3b',
    toolbarBg: '#064e3b',
    canvasBg: '#022c22',
    editorBg: '#064e3b',
  },
  typography: {
    fontFamilySans: 'Plus Jakarta Sans, sans-serif',
    fontFamilyMono: 'JetBrains Mono, monospace',
    baseSize: '14px',
    headingWeight: '700',
  },
  spacing: {
    unit: 4,
    borderRadiusBase: '8px',
    borderRadiusLg: '12px',
    sidebarWidth: '240px',
  },
  components: {
    buttonRadius: '8px',
    cardShadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)',
    designerGridVisible: true,
    designerGridColor: '#047857',
    editorLineNumbers: true,
  },
};

export const DEFAULT_THEMES = [
  NUSANTARA_DARK_THEME,
  NUSANTARA_LIGHT_THEME,
  NUSANTARA_EMERALD_THEME,
];
