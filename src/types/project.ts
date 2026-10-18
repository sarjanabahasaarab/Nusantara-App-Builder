/**
 * Nusantara App Builder - Project Types
 * Phase 2: Android Project Engine & Generator
 */

export type ProjectTemplateId =
  | 'empty-android'
  | 'basic-activity'
  | 'webview-starter'
  | 'blank-app'
  | 'website-app'
  | 'business-app'
  | 'school-app'
  | 'news-app'
  | 'food-app'
  | 'store-app'
  | 'portfolio-app'
  | 'api-app'
  | 'sqlite-app';

export interface ProjectTemplate {
  id: ProjectTemplateId;
  name: string;
  nameId: string;
  description: string;
  descriptionId: string;
  minSdk: number;
  targetSdk: number;
  compileSdk: number;
  features: string[];
  featuresId: string[];
}

export interface ProjectFile {
  path: string;
  name: string;
  content: string;
  isDirectory?: boolean;
  size?: number;
  isExecutable?: boolean;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  displayName: string;
  packageId: string;
  location: string;
  description: string;
  template: ProjectTemplateId;
  language: 'kotlin';
  interfaceLanguage: 'id' | 'en';
  createdAt: string;
  updatedAt: string;
  minSdk: number;
  targetSdk: number;
  compileSdk: number;
  versionCode: number;
  versionName: string;
  targetUrl?: string; // For webview starter
  formatVersion: '2.0';
  filesCount?: number;
  toolchainVersion?: {
    agp: string;
    gradle: string;
    kotlin: string;
    jdk: string;
  };
}

export interface CreateProjectInput {
  name: string;
  displayName?: string;
  packageId: string;
  location: string;
  description?: string;
  template: ProjectTemplateId;
  versionCode?: number;
  versionName?: string;
  minSdk?: number;
  targetSdk?: number;
  compileSdk?: number;
  targetUrl?: string;
  interfaceLanguage: 'id' | 'en';
  allowOverwrite?: boolean;
}

export interface ValidationError {
  field:
    | 'name'
    | 'displayName'
    | 'packageId'
    | 'location'
    | 'description'
    | 'template'
    | 'versionCode'
    | 'versionName'
    | 'targetUrl'
    | 'general';
  message: string;
  messageId: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ProjectIntegrityIssue {
  severity: 'error' | 'warning' | 'info';
  file?: string;
  message: string;
  messageId: string;
}

export interface ProjectValidationReport {
  timestamp: string;
  isValid: boolean;
  checkedFilesCount: number;
  issues: ProjectIntegrityIssue[];
  gradleConfigSummary: {
    namespace: string;
    compileSdk: number;
    minSdk: number;
    targetSdk: number;
    versionCode: number;
    versionName: string;
    hasViewBinding: boolean;
    hasGradleWrapper: boolean;
  };
}

export interface BuildProcessOutput {
  status: 'idle' | 'running' | 'success' | 'failed' | 'cancelled';
  task: string;
  startTime?: string;
  endTime?: string;
  durationMs?: number;
  exitCode?: number;
  logs: string[];
  errorSummary?: string;
  artifactPath?: string;
}
