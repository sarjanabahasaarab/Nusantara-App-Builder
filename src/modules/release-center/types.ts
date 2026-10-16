/**
 * Nusantara App Builder - Professional APK & AAB Release Center Types
 * Phase 8: Data types for Release Wizard, Build Profiles, Version Management,
 * Artifact Inspection, Production Checklist, Release Export, and Phase 9 Extension Points.
 */

export type ReleaseType = 'apk' | 'aab' | 'both';

export type BuildProfileType = 'debug' | 'release' | 'production';

export interface BuildProfile {
  id: string;
  name: string;
  type: BuildProfileType;
  isDebuggable: boolean;
  isMinifyEnabled: boolean; // R8 code optimization
  isShrinkResourcesEnabled: boolean;
  signingProfileId: string;
  apiBaseUrl: string;
  applicationIdSuffix?: string;
  strictChecks: boolean;
  description: string;
  descriptionId: string;
}

export interface ReleaseSigningProfile {
  id: string;
  name: string;
  keystorePath: string;
  keyAlias: string;
  v1Signing: boolean;
  v2Signing: boolean;
  storePasswordSet: boolean;
  keyPasswordSet: boolean;
  isConfigured: boolean;
  validUntil?: string;
}

export type ChecklistCategory =
  | 'identity'
  | 'version'
  | 'security'
  | 'signing'
  | 'network'
  | 'quality';

export interface ProductionChecklistItem {
  id: string;
  label: string;
  labelId: string;
  description: string;
  descriptionId: string;
  category: ChecklistCategory;
  checked: boolean;
  isAutomated: boolean;
  automatedStatus?: 'passed' | 'warning' | 'error';
  errorMessage?: string;
  errorMessageId?: string;
}

export interface ArtifactSignatureDetails {
  scheme: string; // e.g., "APK Signature Scheme v2 + v1"
  algorithm: string; // e.g., "SHA256withRSA"
  certificateFingerprintSha256: string;
  issuer: string;
  validUntil: string;
  isValid: boolean;
}

export interface ArtifactMetadata {
  fileName: string;
  filePath: string;
  format: 'apk' | 'aab';
  sizeBytes: number;
  formattedSize: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdk: number;
  targetSdk: number;
  compileSdk: number;
  isDebuggable: boolean;
  isSigned: boolean;
  signatureDetails?: ArtifactSignatureDetails;
  abiList: string[]; // e.g. ["arm64-v8a", "armeabi-v7a", "x86_64"]
  permissions: string[];
  moduleList?: string[]; // for AAB e.g. ["base"]
  createdAt: string;
  sha256: string;
}

export interface ReleaseHistoryItem {
  id: string;
  projectId: string;
  projectName: string;
  version: string;
  versionCode: number;
  variant: string;
  releaseType: 'apk' | 'aab';
  artifactPath: string;
  artifactSize: string;
  buildDurationMs: number;
  status: 'success' | 'failed' | 'cancelled';
  timestamp: string;
  releaseNotes: string;
  gitTag?: string;
  reportPath?: string;
  sha256?: string;
}

export interface ReleaseReport {
  appName: string;
  applicationId: string;
  versionName: string;
  versionCode: number;
  variant: string;
  artifactType: 'apk' | 'aab';
  artifactSize: string;
  artifactPath: string;
  signingStatus: string;
  buildStatus: 'SUCCESS' | 'FAILED';
  validationStatus: 'PASSED' | 'FAILED';
  timestamp: string;
  buildDuration: string;
  checklistPassedCount: number;
  checklistTotalCount: number;
  releaseNotes: string;
  sha256?: string;
}

export interface SensitiveFileIssue {
  file: string;
  risk: 'critical' | 'high' | 'medium';
  description: string;
  descriptionId: string;
  recommendation: string;
  recommendationId: string;
}

export interface ReleaseValidationReport {
  isBlocked: boolean;
  hasWarnings: boolean;
  errorsCount: number;
  warningsCount: number;
  sensitiveFiles: SensitiveFileIssue[];
  issues: {
    severity: 'error' | 'warning' | 'info';
    field?: string;
    description: string;
    descriptionId: string;
    suggestedFix: string;
    suggestedFixId: string;
  }[];
}

// ----------------------------------------------------------------------
// Phase 9 Extension Points (AdMob & Monetization Foundation)
// ----------------------------------------------------------------------
export interface AdMobExtensionPointConfig {
  enabled: boolean;
  appId: string;
  testMode: boolean;
  bannerAdUnitId?: string;
  interstitialAdUnitId?: string;
  rewardedAdUnitId?: string;
  nativeAdUnitId?: string;
  consentConfigured: boolean;
  placementsCount: number;
}
