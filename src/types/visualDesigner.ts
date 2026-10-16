/**
 * Nusantara App Builder - Visual Designer Types
 * Phase 3: Visual Designer, Component Palette, Canvas, Properties, and Android XML Layout Generation
 */

export type ComponentCategory = 'layout' | 'text' | 'input' | 'media' | 'monetization' | 'other';

export type ComponentType =
  // Layout
  | 'linearLayout'
  | 'verticalLayout'
  | 'horizontalLayout'
  | 'container'
  | 'scrollView'
  | 'card'
  // Text
  | 'text'
  | 'heading'
  | 'label'
  // Input
  | 'button'
  | 'textField'
  | 'passwordField'
  | 'checkbox'
  | 'switch'
  | 'radioButton'
  // Media
  | 'image'
  | 'imageButton'
  // Monetization (Phase 9)
  | 'admobBanner'
  | 'admobInterstitial'
  | 'admobRewarded'
  | 'admobNative'
  // Other
  | 'divider'
  | 'spacer'
  | 'progressBar';

export type LayoutDimension = 'match_parent' | 'wrap_content' | number;
export type ComponentVisibility = 'visible' | 'invisible' | 'gone';
export type TextAlignment = 'start' | 'center' | 'end';
export type ImageScaleType = 'centerCrop' | 'fitCenter' | 'centerInside' | 'fitXY';
export type ButtonActionType = 'none' | 'navigate' | 'toast' | 'openUrl';

export interface ComponentProperties {
  // General Identifiers & Layout
  id: string;
  name: string;
  width: LayoutDimension;
  height: LayoutDimension;
  marginTop?: number;
  marginBottom?: number;
  marginStart?: number;
  marginEnd?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingStart?: number;
  paddingEnd?: number;
  visibility?: ComponentVisibility;
  backgroundColor?: string;
  opacity?: number;

  // Typography (Text, Heading, Label)
  text?: string;
  textSize?: number; // in sp
  textColor?: string;
  textStyle?: 'normal' | 'bold' | 'italic';
  textAlignment?: TextAlignment;
  maxLines?: number;

  // Button
  buttonLabel?: string;
  buttonTextColor?: string;
  buttonBackgroundColor?: string;
  cornerRadius?: number; // in dp
  actionType?: ButtonActionType;
  actionPayload?: string;

  // Text Field / Password Field
  hint?: string;
  inputType?: 'text' | 'number' | 'textEmailAddress' | 'phone' | 'textPassword';
  isRequired?: boolean;
  isPassword?: boolean;

  // Image & Image Button
  imageSrc?: string;
  contentDescription?: string;
  scaleType?: ImageScaleType;

  // Card
  elevation?: number; // in dp
  cardCornerRadius?: number;

  // Container / Linear Layout
  orientation?: 'vertical' | 'horizontal';
  gravity?: 'start' | 'center' | 'end' | 'center_vertical' | 'center_horizontal';
  spacing?: number; // Gap between children in dp
  isScrollable?: boolean;

  // Selection Inputs (Checkbox, Switch, Radio)
  isChecked?: boolean;
  label?: string;
  tintColor?: string;

  // Progress Bar
  progress?: number;
  maxProgress?: number;
  isIndeterminate?: boolean;
  progressStyle?: 'horizontal' | 'circular';

  // AdMob & Monetization (Phase 9)
  adUnitId?: string;
  adSize?: 'BANNER' | 'LARGE_BANNER' | 'MEDIUM_RECTANGLE' | 'FULL_BANNER' | 'LEADERBOARD' | 'SMART_BANNER';
  adPosition?: 'top' | 'bottom' | 'custom';
  adTrigger?: 'after_page' | 'after_action' | 'after_navigation' | 'manual';
  adRewardName?: string;
  adRewardAmount?: number;
  nativeTemplate?: 'small' | 'medium' | 'large' | 'custom';

  // Custom metadata / escape hatches
  customAttributes?: Record<string, string>;
}

export interface VisualComponent {
  id: string;
  type: ComponentType;
  name: string;
  properties: ComponentProperties;
  children?: VisualComponent[];
}

export type ScreenOrientation = 'portrait' | 'landscape';

export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  density: string;
  platform: 'phone' | 'tablet';
}

export const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'pixel_7', name: 'Google Pixel 7 (1080 × 2400)', width: 412, height: 915, density: '420dpi', platform: 'phone' },
  { id: 'galaxy_s23', name: 'Samsung Galaxy S23 (1080 × 2340)', width: 393, height: 852, density: '440dpi', platform: 'phone' },
  { id: 'pixel_tablet', name: 'Pixel Tablet 11" (1600 × 2560)', width: 800, height: 1280, density: '320dpi', platform: 'tablet' },
  { id: 'compact_phone', name: 'Compact Phone (720 × 1600)', width: 360, height: 800, density: '320dpi', platform: 'phone' },
];

export interface VisualScreen {
  id: string;
  name: string;
  layoutFileName: string; // e.g. activity_main.xml or screen_profile.xml
  orientation: ScreenOrientation;
  devicePreset: string;
  backgroundColor: string;
  root: VisualComponent;
}

export interface VisualProjectDesign {
  schemaVersion: 1;
  projectId: string;
  projectName: string;
  packageId: string;
  screens: VisualScreen[];
  activeScreenId: string;
  startScreenId: string;
  createdAt: string;
  updatedAt: string;
  formatVersion: '3.0';
}

export interface ComponentPaletteItem {
  type: ComponentType;
  category: ComponentCategory;
  name: string;
  nameId: string;
  description: string;
  descriptionId: string;
  iconName: string;
  defaultProperties: Partial<ComponentProperties>;
  isContainer: boolean;
}

export interface GeneratedLayoutResult {
  fileName: string;
  relativePath: string;
  fullXml: string;
  companionKotlinBindingStub?: string;
  extractedStrings?: Record<string, string>;
  extractedColors?: Record<string, string>;
}
