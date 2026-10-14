/**
 * Nusantara App Builder - Settings & Environment Types
 * Phase 2: Detailed toolchain diagnostic and verification
 */

export type ThemeMode = 'dark' | 'light' | 'system';
export type LanguageCode = 'id' | 'en';

export type ComponentStatus = 'installed' | 'missing' | 'misconfigured' | 'unable-to-detect';

export interface DetailedToolchainComponent {
  name: string;
  category: 'sdk' | 'adb' | 'platform' | 'jdk' | 'gradle' | 'permissions';
  configuredPath: string;
  detectedPath?: string;
  version?: string;
  status: ComponentStatus;
  isAvailable: boolean;
  statusText: string;
  statusTextId: string;
  lastChecked?: string;
  diagnosticAdvice?: string;
  diagnosticAdviceId?: string;
}

export interface EnvironmentStatus {
  isChecking: boolean;
  lastChecked: string | null;
  overallReady: boolean;
  components: {
    androidSdk: DetailedToolchainComponent;
    adb: DetailedToolchainComponent;
    sdkPlatform: DetailedToolchainComponent;
    jdk: DetailedToolchainComponent;
    gradle: DetailedToolchainComponent;
    directoryAccess: DetailedToolchainComponent;
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
    defaultVersionName: string;
    defaultVersionCode: number;
  };
  toolchain: {
    androidSdkPath: string;
    jdkPath: string;
    gradlePath: string;
    autoDetect: boolean;
    compatibleAgpVersion: string;
    compatibleGradleVersion: string;
    compatibleKotlinVersion: string;
    compatibleJdkVersion: string;
  };
}
