/**
 * Nusantara App Builder - Theme System Types
 * Phase 10: Design tokens, custom themes, and typography/spacing configurations.
 */

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderFocus: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentText: string;
  sidebarBg: string;
  toolbarBg: string;
  canvasBg: string;
  editorBg: string;
}

export interface ThemeTypography {
  fontFamilySans: string;
  fontFamilyMono: string;
  baseSize: string; // e.g. "14px"
  headingWeight: string; // e.g. "700"
}

export interface ThemeSpacing {
  unit: number; // e.g. 4 (standard 4px grid)
  borderRadiusBase: string; // e.g. "8px"
  borderRadiusLg: string; // e.g. "12px"
  sidebarWidth: string; // e.g. "240px"
}

export interface ThemeComponents {
  buttonRadius: string;
  cardShadow: string;
  designerGridVisible: boolean;
  designerGridColor: string;
  editorLineNumbers: boolean;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  version: string;
  isBuiltin?: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  components: ThemeComponents;
}
