/**
 * Nusantara App Builder - Phase 8 Test Suite
 * Professional APK & AAB Release Center Tests:
 * Version Management, Pre-Release Validation Gate, Keystore Signing,
 * Artifact Inspector, Release Exporter, and Git Tag Safety.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VersionManager } from '../modules/release-center/services/versionManager';
import { ReleaseValidator } from '../modules/release-center/services/releaseValidator';
import { ArtifactInspector } from '../modules/release-center/services/artifactInspector';
import { ReleaseExporter } from '../modules/release-center/services/releaseExporter';
import { GitSafetyService } from '../modules/release-center/services/gitSafetyService';
import { ProjectMetadata, ProjectFile } from '../types/project';
import { BuildProfile, ReleaseSigningProfile } from '../modules/release-center/types';

describe('Phase 8 — VersionManager', () => {
  it('validates proper semantic version names', () => {
    expect(VersionManager.validateVersionName('1.0.0').isValid).toBe(true);
    expect(VersionManager.validateVersionName('2.1.4').isValid).toBe(true);
    expect(VersionManager.validateVersionName('1.0.0-beta1').isValid).toBe(true);
    expect(VersionManager.validateVersionName('1.0').isValid).toBe(true);
  });

  it('rejects invalid or empty version names', () => {
    expect(VersionManager.validateVersionName('').isValid).toBe(false);
    expect(VersionManager.validateVersionName('alpha').isValid).toBe(false);
    expect(VersionManager.validateVersionName('v1.0.0').isValid).toBe(false); // Should be bare SemVer
  });

  it('validates version code within Google Play limits (1 to 2.1B)', () => {
    expect(VersionManager.validateVersionCode(1).isValid).toBe(true);
    expect(VersionManager.validateVersionCode(100).isValid).toBe(true);
    expect(VersionManager.validateVersionCode(0).isValid).toBe(false);
    expect(VersionManager.validateVersionCode(-5).isValid).toBe(false);
    expect(VersionManager.validateVersionCode(1.5).isValid).toBe(false);
    expect(VersionManager.validateVersionCode(2_200_000_000).isValid).toBe(false);
  });

  it('enforces version code strictly greater than previous release code', () => {
    expect(VersionManager.validateVersionCode(2, 1).isValid).toBe(true);
    expect(VersionManager.validateVersionCode(1, 1).isValid).toBe(false);
    expect(VersionManager.validateVersionCode(1, 2).isValid).toBe(false);
  });

  it('increments patch version correctly', () => {
    expect(VersionManager.incrementPatch('1.0.0')).toBe('1.0.1');
    expect(VersionManager.incrementPatch('1.0.9')).toBe('1.0.10');
    expect(VersionManager.incrementPatch('2.3.4')).toBe('2.3.5');
  });

  it('increments minor version correctly and resets patch to 0', () => {
    expect(VersionManager.incrementMinor('1.0.5')).toBe('1.1.0');
    expect(VersionManager.incrementMinor('2.3.9')).toBe('2.4.0');
  });

  it('increments major version correctly and resets minor and patch to 0', () => {
    expect(VersionManager.incrementMajor('1.2.3')).toBe('2.0.0');
    expect(VersionManager.incrementMajor('0.9.1')).toBe('1.0.0');
  });

  it('increments version code integer', () => {
    expect(VersionManager.incrementVersionCode(1)).toBe(2);
    expect(VersionManager.incrementVersionCode(42)).toBe(43);
  });
});

describe('Phase 8 — ReleaseValidator & Production Checklist', () => {
  const dummyProject: ProjectMetadata = {
    id: 'proj_test',
    name: 'Nusantara POS',
    displayName: 'Nusantara POS',
    packageId: 'id.nusantara.pos',
    location: 'C:\\Users\\User\\NusantaraProjects\\NusantaraPOS',
    description: 'Point of sale application',
    template: 'basic-activity',
    language: 'kotlin',
    interfaceLanguage: 'id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    minSdk: 24,
    targetSdk: 34,
    compileSdk: 34,
    versionCode: 2,
    versionName: '1.0.0',
    formatVersion: '2.0',
    filesCount: 10,
  };

  const dummyFiles: ProjectFile[] = [
    { path: 'app/build.gradle.kts', name: 'build.gradle.kts', content: 'plugins {}' },
    { path: 'app/src/main/AndroidManifest.xml', name: 'AndroidManifest.xml', content: '<manifest></manifest>' },
  ];

  const prodProfile: BuildProfile = {
    id: 'prod',
    name: 'Production',
    type: 'production',
    isDebuggable: false,
    isMinifyEnabled: true,
    isShrinkResourcesEnabled: true,
    signingProfileId: 'sign_1',
    apiBaseUrl: 'https://api.nusantara.id',
    strictChecks: true,
    description: 'Production',
    descriptionId: 'Produksi',
  };

  const validSigning: ReleaseSigningProfile = {
    id: 'sign_1',
    name: 'Release Key',
    keystorePath: 'C:\\keystores\\release.jks',
    keyAlias: 'release',
    v1Signing: true,
    v2Signing: true,
    storePasswordSet: true,
    keyPasswordSet: true,
    isConfigured: true,
    validUntil: '2054-12-31',
  };

  it('passes validation for valid project and profile', () => {
    const report = ReleaseValidator.validateRelease(dummyProject, dummyFiles, prodProfile, validSigning);
    expect(report.isBlocked).toBe(false);
    expect(report.errorsCount).toBe(0);
  });

  it('detects sensitive files that must not be committed or exposed', () => {
    const filesWithSecrets: ProjectFile[] = [
      ...dummyFiles,
      { path: 'app/src/main/secrets/google-services-key.jks', name: 'google-services-key.jks', content: 'binary' },
      { path: '.env', name: '.env', content: 'SECRET_API_KEY=12345' },
    ];
    const sensitive = ReleaseValidator.scanSensitiveFiles(filesWithSecrets);
    expect(sensitive.length).toBe(2);
    expect(sensitive.some((s) => s.file.includes('.jks'))).toBe(true);
    expect(sensitive.some((s) => s.file.includes('.env'))).toBe(true);
  });

  it('blocks release if default package ID com.example is used', () => {
    const defaultPkgProject = { ...dummyProject, packageId: 'com.example.myapp' };
    const report = ReleaseValidator.validateRelease(defaultPkgProject, dummyFiles, prodProfile, validSigning);
    expect(report.isBlocked).toBe(true);
    expect(report.issues.some((i) => i.field === 'packageId')).toBe(true);
  });

  it('blocks release if signing keystore is not configured', () => {
    const unconfiguredSigning: ReleaseSigningProfile = {
      ...validSigning,
      keystorePath: '',
      isConfigured: false,
    };
    const report = ReleaseValidator.validateRelease(dummyProject, dummyFiles, prodProfile, unconfiguredSigning);
    expect(report.isBlocked).toBe(true);
    expect(report.issues.some((i) => i.field === 'signing')).toBe(true);
  });

  it('blocks release if debuggable is enabled on production profile', () => {
    const debuggableProdProfile: BuildProfile = {
      ...prodProfile,
      isDebuggable: true,
    };
    const report = ReleaseValidator.validateRelease(dummyProject, dummyFiles, debuggableProdProfile, validSigning);
    expect(report.isBlocked).toBe(true);
    expect(report.issues.some((i) => i.description.toLowerCase().includes('debuggable'))).toBe(true);
  });

  it('creates production checklist with categories', () => {
    const checklist = ReleaseValidator.createDefaultChecklist();
    expect(checklist.length).toBeGreaterThanOrEqual(8);
    const categories = new Set(checklist.map((c) => c.category));
    expect(categories.has('identity')).toBe(true);
    expect(categories.has('signing')).toBe(true);
    expect(categories.has('security')).toBe(true);
  });
});

describe('Phase 8 — ArtifactInspector', () => {
  const dummyProject: ProjectMetadata = {
    id: 'proj_test',
    name: 'Nusantara App',
    displayName: 'Nusantara App',
    packageId: 'id.nusantara.app',
    location: 'C:\\Users\\User\\NusantaraProjects\\NusantaraApp',
    description: '',
    template: 'basic-activity',
    language: 'kotlin',
    interfaceLanguage: 'id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    minSdk: 24,
    targetSdk: 34,
    compileSdk: 34,
    versionCode: 1,
    versionName: '1.0.0',
    formatVersion: '2.0',
    filesCount: 5,
  };

  it('inspects APK artifacts and extracts signature schemes & ABIs', async () => {
    const result = await ArtifactInspector.inspectArtifact(
      'build/outputs/apk/release/app-release.apk',
      dummyProject,
      'apk',
      true
    );

    expect(result.isValid).toBe(true);
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.format).toBe('apk');
    expect(result.metadata?.signatureDetails?.isValid).toBe(true);
    expect(result.metadata?.signatureDetails?.scheme).toContain('APK Signature Scheme');
    expect(result.metadata?.abiList.length).toBeGreaterThan(0);
    expect(result.metadata?.permissions).toContain('android.permission.INTERNET');
  });

  it('inspects AAB (Android App Bundle) artifacts', async () => {
    const result = await ArtifactInspector.inspectArtifact(
      'build/outputs/bundle/release/app-release.aab',
      dummyProject,
      'aab',
      true
    );

    expect(result.isValid).toBe(true);
    expect(result.metadata?.format).toBe('aab');
    expect(result.metadata?.moduleList).toContain('base');
  });

  it('handles empty artifact paths gracefully', async () => {
    const result = await ArtifactInspector.inspectArtifact('', dummyProject, 'apk');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('Phase 8 — ReleaseExporter', () => {
  const dummyProject: ProjectMetadata = {
    id: 'proj_test',
    name: 'My Special App : 2026',
    displayName: 'My Special App : 2026',
    packageId: 'id.nusantara.special',
    location: 'C:\\Users\\User\\NusantaraProjects\\Special',
    description: '',
    template: 'basic-activity',
    language: 'kotlin',
    interfaceLanguage: 'id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    minSdk: 24,
    targetSdk: 34,
    compileSdk: 34,
    versionCode: 3,
    versionName: '1.2.0',
    formatVersion: '2.0',
    filesCount: 8,
  };

  it('sanitizes unsafe Windows characters in release filenames', () => {
    const sanitized = ReleaseExporter.sanitizeFileName('My : Bad / File * Name ?');
    expect(sanitized).toBe('My-Bad-File-Name');
    expect(sanitized).not.toContain(':');
    expect(sanitized).not.toContain('/');
    expect(sanitized).not.toContain('*');
    expect(sanitized).not.toContain('?');
  });

  it('generates standardized artifact release name', () => {
    const apkName = ReleaseExporter.generateReleaseFileName(dummyProject, 'apk', 'release');
    expect(apkName).toBe('My-Special-App-2026-v1.2.0-build3-release.apk');

    const aabName = ReleaseExporter.generateReleaseFileName(dummyProject, 'aab', 'release');
    expect(aabName).toBe('My-Special-App-2026-v1.2.0-build3-release.aab');
  });

  it('generates structured release report model and HTML', () => {
    const mockArtifact = {
      fileName: 'app-release.aab',
      filePath: 'releases/v1.2.0/app-release.aab',
      format: 'aab' as const,
      sizeBytes: 5_000_000,
      formattedSize: '5.0 MB',
      packageName: 'id.nusantara.special',
      versionName: '1.2.0',
      versionCode: 3,
      minSdk: 24,
      targetSdk: 34,
      compileSdk: 34,
      isDebuggable: false,
      isSigned: true,
      abiList: ['Universal'],
      permissions: ['INTERNET'],
      createdAt: new Date().toISOString(),
      sha256: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
    };

    const report = ReleaseExporter.generateReleaseReport(
      dummyProject,
      mockArtifact,
      'Production',
      'Initial official release',
      8,
      8,
      4.2
    );

    expect(report.appName).toBe(dummyProject.name);
    expect(report.buildStatus).toBe('SUCCESS');
    expect(report.sha256).toBe(mockArtifact.sha256);

    const html = ReleaseExporter.generateReleaseReportHtml(report);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain(dummyProject.name);
    expect(html).toContain(dummyProject.packageId);
    expect(html).toContain('BUILD SUCCESSFUL');
    expect(html).toContain(mockArtifact.sha256);
  });
});

describe('Phase 8 — GitSafetyService', () => {
  it('validates proper Git release tags', () => {
    expect(GitSafetyService.validateGitTag('v1.0.0').isValid).toBe(true);
    expect(GitSafetyService.validateGitTag('1.0.0').isValid).toBe(true);
    expect(GitSafetyService.validateGitTag('1.0.0').tagName).toBe('v1.0.0'); // auto-normalizes with 'v'
    expect(GitSafetyService.validateGitTag('v2.1.0-release').isValid).toBe(true);
  });

  it('rejects invalid or unsafe Git tag names', () => {
    expect(GitSafetyService.validateGitTag('').isValid).toBe(false);
    expect(GitSafetyService.validateGitTag('release test with space').isValid).toBe(false);
  });

  it('generates standard safe Git commands for release tagging', () => {
    const commands = GitSafetyService.generateGitCommands('1.0.0');
    expect(commands[0]).toBe('git tag -a v1.0.0 -m "Release v1.0.0"');
    expect(commands[1]).toBe('git push origin v1.0.0');
  });
});
