/**
 * Nusantara App Builder - Update Manager Types
 * Phase 10: Semantic version comparison, release changelog inspection, and signed update delivery.
 */

export interface AppReleaseVersion {
  version: string;
  releaseDate: string;
  isMandatory: boolean;
  highlights: string[];
  highlightsId: string[];
  downloadUrl: {
    windowsInstaller: string;
    windowsPortable: string;
  };
  sha256Checksum: string;
  signatureVerified: boolean;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: AppReleaseVersion;
}
