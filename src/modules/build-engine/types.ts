/**
 * Nusantara App Builder - Professional Android Build Engine Types
 * Phase 7: Types for Build Center, Toolchain Detection, Gradle Runner,
 * Error Parser, Signing Keystore, Artifacts, ADB Devices, and Logcat.
 */

export type BuildTaskType =
  | 'assembleDebug'
  | 'assembleRelease'
  | 'bundleRelease'
  | 'clean'
  | 'check';

export type BuildVariant = 'debug' | 'release';

export type BuildTarget = 'apk' | 'aab';

export type BuildStatus =
  | 'idle'
  | 'validating'
  | 'running'
  | 'success'
  | 'failed'
  | 'cancelled';

export type ValidationLevel = 'quick' | 'full' | 'build';

export interface BuildLogEntry {
  id: string;
  timestamp: string; // [HH:mm:ss]
  level: 'info' | 'warn' | 'error' | 'success' | 'task';
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface ParsedGradleError {
  task?: string;
  file?: string;
  line?: number;
  column?: number;
  message: string;
  errorType: 'kotlin' | 'java' | 'aapt2' | 'manifest' | 'gradle' | 'signing' | 'sdk' | 'unknown';
  suggestedFix?: string;
  suggestedFixId?: string;
}

export interface BuildArtifact {
  id: string;
  name: string;
  type: 'apk' | 'aab';
  variant: 'debug' | 'release';
  sizeBytes: number;
  formattedSize: string;
  location: string;
  createdAt: string;
  sha256?: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdk: number;
  targetSdk: number;
}

export interface BuildHistoryRecord {
  id: string;
  projectId: string;
  projectName: string;
  variant: BuildVariant;
  target: BuildTarget;
  status: BuildStatus;
  startTime: string;
  endTime: string;
  durationMs: number;
  artifactPath?: string;
  artifactSize?: string;
  exitCode: number;
  logSummary: string[];
  error?: ParsedGradleError;
}

export interface BuildConfiguration {
  variant: BuildVariant;
  target: BuildTarget;
  validationLevel: ValidationLevel;
  offlineMode: boolean;
  parallelBuild: 'auto' | 'enabled' | 'disabled';
  buildCache: boolean;
  maxWorkers?: number;
  customJvmArgs?: string;
}

export interface SigningConfiguration {
  id: string;
  name: string;
  keystorePath: string;
  keyAlias: string;
  isConfigured: boolean;
  v1SigningEnabled: boolean;
  v2SigningEnabled: boolean;
  storePasswordSet: boolean;
  keyPasswordSet: boolean;
  validUntil?: string;
}

export interface CreateKeystoreInput {
  destinationPath: string;
  keystoreName: string;
  alias: string;
  storePassword: string;
  keyPassword?: string;
  validityYears: number;
  commonName: string;
  organizationUnit?: string;
  organization?: string;
  city?: string;
  state?: string;
  countryCode: string;
}

export interface ConnectedDevice {
  id: string;
  serial: string;
  model: string;
  manufacturer: string;
  androidVersion: string;
  apiLevel: number;
  connectionType: 'usb' | 'wifi';
  status: 'device' | 'offline' | 'unauthorized';
  batteryPercent?: number;
}

export interface LogcatEntry {
  id: string;
  timestamp: string;
  pid: string;
  tid: string;
  level: 'V' | 'D' | 'I' | 'W' | 'E' | 'F';
  tag: string;
  message: string;
}

export interface ToolchainDiagnosis {
  os: {
    platform: string;
    arch: string;
    isWindows: boolean;
    release: string;
    totalMemoryMb?: number;
  };
  java: {
    installed: boolean;
    version?: string;
    vendor?: string;
    javaHome?: string;
    path?: string;
    arch?: string;
    exitCode?: number;
  };
  androidSdk: {
    installed: boolean;
    path?: string;
    source: 'ANDROID_HOME' | 'ANDROID_SDK_ROOT' | 'Windows Registry/AppData' | 'manual' | 'none';
    adbAvailable: boolean;
    adbPath?: string;
    aapt2Available: boolean;
    sdkmanagerAvailable: boolean;
    installedPlatforms: number[];
    installedBuildTools: string[];
    hasPlatformTools: boolean;
    hasCmdlineTools: boolean;
  };
  gradle: {
    wrapperAvailable: boolean;
    wrapperVersion?: string;
    globalInstalled: boolean;
    globalVersion?: string;
  };
  overallReady: boolean;
  diagnosticAdvice: string[];
  diagnosticAdviceId: string[];
}
