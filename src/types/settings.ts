/**
 * Nusantara App Builder - Settings & Environment Types
 */

export type ThemeMode = 'dark' | 'light' | 'system';
export type LanguageCode = 'id' | 'en';

export interface ToolchainComponent {
  name: string;
  configuredPath: string;
  detectedPath?: string;
  version?: string;
  isAvailable: boolean;
  lastChecked?: string;
  error?: string;
}

export interface EnvironmentStatus {
  isChecking: boolean;
  lastChecked: string | null;
  overallReady: boolean;
  components: {
    androidSdk: ToolchainComponent;
    jdk: ToolchainComponent;
    gradle: ToolchainComponent;
  };
}

export interface AppSettings {
  general: {
    defaultProjectsDirectory: string;
    autoSaveIntervalSeconds: number;
    reopenLastProjectOnStartup: boolean;
    telemetryEnabled: boolean;
  };
  appearance: {
    theme: ThemeMode;
    accentColor: string;
    compactMode: boolean;
  };
  language: {
    current: LanguageCode;
    fallback: LanguageCode;
  };
  projectDefaults: {
    defaultPackagePrefix: string;
    defaultTemplate: 'empty-android' | 'basic-activity' | 'webview-starter';
    defaultCompileSdk: number;
    defaultMinSdk: number;
  };
  toolchain: {
    androidSdkPath: string;
    jdkPath: string;
    gradlePath: string;
    autoDetect: boolean;
  };
}
