/**
 * Nusantara App Builder - Release Validator & Production Checklist Engine
 * Phase 8: Strict release gating, debuggable check, sensitive files scanner,
 * and production verification checklist.
 */

import {
  BuildProfile,
  ReleaseSigningProfile,
  ReleaseValidationReport,
  ProductionChecklistItem,
  SensitiveFileIssue,
} from '../types';
import { ProjectMetadata, ProjectFile } from '../../../types/project';
import { VersionManager } from './versionManager';
import { validatePackageId } from '../../../validation/projectValidator';

export class ReleaseValidator {
  /**
   * Sensitive file patterns that must never be exposed or bundled carelessly
   */
  public static readonly SENSITIVE_PATTERNS = [
    { pattern: /\.jks$/i, risk: 'critical' as const, name: 'Keystore (.jks)', desc: 'Android private signing key' },
    { pattern: /\.keystore$/i, risk: 'critical' as const, name: 'Keystore (.keystore)', desc: 'Android private signing key' },
    { pattern: /\.key$/i, risk: 'critical' as const, name: 'Private Key (.key)', desc: 'Cryptographic private key' },
    { pattern: /\.env$/i, risk: 'high' as const, name: 'Environment File (.env)', desc: 'Application environment secrets' },
    { pattern: /(?:^|[\\/])secrets[\\/]/i, risk: 'high' as const, name: 'Secrets Directory', desc: 'Private credentials directory' },
    { pattern: /(?:^|[\\/])credentials[\\/]/i, risk: 'critical' as const, name: 'Credentials Directory', desc: 'API credentials directory' },
  ];

  /**
   * Scans project files for potential sensitive keys or credentials
   */
  public static scanSensitiveFiles(files: ProjectFile[]): SensitiveFileIssue[] {
    const issues: SensitiveFileIssue[] = [];

    for (const file of files) {
      for (const p of this.SENSITIVE_PATTERNS) {
        if (p.pattern.test(file.path)) {
          issues.push({
            file: file.path,
            risk: p.risk,
            description: `Potential sensitive file found: ${p.name} (${p.desc}).`,
            descriptionId: `Berkas sensitif terdeteksi: ${p.name} (${p.desc}).`,
            recommendation: 'Ensure this file is listed in .gitignore and never checked into source control or public directories.',
            recommendationId: 'Pastikan berkas ini terdaftar di .gitignore dan jangan pernah dimasukkan ke source control publik.',
          });
          break;
        }
      }
    }

    return issues;
  }

  /**
   * Performs full release gating validation
   */
  public static validateRelease(
    project: ProjectMetadata,
    files: ProjectFile[],
    profile: BuildProfile,
    signing: ReleaseSigningProfile
  ): ReleaseValidationReport {
    const issues: ReleaseValidationReport['issues'] = [];
    const sensitiveFiles = this.scanSensitiveFiles(files);

    // 1. Package ID Validation
    const pkgErrors = validatePackageId(project.packageId);
    if (pkgErrors.length > 0) {
      issues.push({
        severity: 'error',
        field: 'packageId',
        description: `Invalid Application ID: "${project.packageId}". ${pkgErrors[0].message}`,
        descriptionId: `Application ID tidak valid: "${project.packageId}". ${pkgErrors[0].messageId}`,
        suggestedFix: 'Fix Package ID format in App Settings (e.g. id.nusantara.myapp).',
        suggestedFixId: 'Perbaiki format Package ID pada Pengaturan Aplikasi (cth: id.nusantara.myapp).',
      });
    } else if (project.packageId.startsWith('com.example.') || project.packageId === 'com.example') {
      issues.push({
        severity: 'error',
        field: 'packageId',
        description: `Package ID uses default template domain "${project.packageId}". Google Play and production releases prohibit "com.example.*".`,
        descriptionId: `Package ID menggunakan domain bawaan "${project.packageId}". Rilis produksi dan Google Play melarang penggunaan "com.example.*".`,
        suggestedFix: 'Change Package ID in App Settings to a unique domain (e.g. id.nusantara.myapp).',
        suggestedFixId: 'Ubah Package ID pada Pengaturan Aplikasi ke domain unik Anda (misal: id.nusantara.myapp).',
      });
    }

    // 2. Version Validation
    const versionNameRes = VersionManager.validateVersionName(project.versionName);
    if (!versionNameRes.isValid) {
      issues.push({
        severity: 'error',
        field: 'versionName',
        description: versionNameRes.error || 'Invalid Version Name.',
        descriptionId: versionNameRes.errorId || 'Version Name tidak valid.',
        suggestedFix: 'Use semantic versioning format such as 1.0.0 or 2.1.0.',
        suggestedFixId: 'Gunakan format semantic versioning seperti 1.0.0 atau 2.1.0.',
      });
    }

    const versionCodeRes = VersionManager.validateVersionCode(project.versionCode);
    if (!versionCodeRes.isValid) {
      issues.push({
        severity: 'error',
        field: 'versionCode',
        description: versionCodeRes.error || 'Invalid Version Code.',
        descriptionId: versionCodeRes.errorId || 'Version Code tidak valid.',
        suggestedFix: 'Set Version Code to a positive integer (e.g. 1, 2, 3).',
        suggestedFixId: 'Atur Version Code menjadi bilangan bulat positif (cth: 1, 2, 3).',
      });
    }

    // 3. Debuggable Check (CRITICAL)
    if (profile.type === 'production' && profile.isDebuggable) {
      issues.push({
        severity: 'error',
        field: 'profile',
        description: 'CRITICAL ERROR: Production build profile is configured as debuggable (isDebuggable: true). Production releases must not be debuggable.',
        descriptionId: 'GALAT KRITIS: Profil build Production dikonfigurasi sebagai debuggable (isDebuggable: true). Rilis produksi tidak boleh debuggable.',
        suggestedFix: 'Set isDebuggable to false in Build Profile.',
        suggestedFixId: 'Atur isDebuggable ke false pada Profil Build.',
      });
    }

    const manifest = files.find((f) => f.path.replace(/\\/g, '/').endsWith('AndroidManifest.xml'));
    if (manifest) {
      if (manifest.content.includes('android:debuggable="true"')) {
        if (profile.type === 'production') {
          issues.push({
            severity: 'error',
            field: 'manifest',
            description: 'CRITICAL ERROR: Production build is configured as debuggable (android:debuggable="true"). Debuggable builds can be reverse-engineered or hooked.',
            descriptionId: 'GALAT KRITIS: Build Production ditandai sebagai debuggable (android:debuggable="true"). Aplikasi debuggable rentan terhadap reverse-engineering.',
            suggestedFix: 'Remove android:debuggable="true" from AndroidManifest.xml for production release.',
            suggestedFixId: 'Hapus android:debuggable="true" dari AndroidManifest.xml sebelum rilis produksi.',
          });
        } else {
          issues.push({
            severity: 'warning',
            field: 'manifest',
            description: 'android:debuggable="true" is set in AndroidManifest.xml.',
            descriptionId: 'android:debuggable="true" terpasang pada AndroidManifest.xml.',
            suggestedFix: 'Ensure debuggable is disabled before publishing to stores.',
            suggestedFixId: 'Pastikan mode debuggable dinonaktifkan sebelum dipublikasikan.',
          });
        }
      }
    }

    // 4. Signing Verification
    if (profile.type === 'production' || profile.type === 'release') {
      if (!signing.isConfigured || !signing.keystorePath) {
        issues.push({
          severity: 'error',
          field: 'signing',
          description: 'Release signing is not configured. Release APK and AAB require an official signing keystore.',
          descriptionId: 'Penandatanganan rilis belum dikonfigurasi. Release APK dan AAB membutuhkan keystore resmi.',
          suggestedFix: 'Configure an existing .jks keystore or generate a new one in the Signing tab.',
          suggestedFixId: 'Konfigurasikan keystore .jks yang sudah ada atau buat baru di tab Signing.',
        });
      }
    }

    // 5. Target SDK & Compile SDK Check
    if (project.targetSdk < 34) {
      issues.push({
        severity: 'warning',
        field: 'targetSdk',
        description: `Target SDK (${project.targetSdk}) is below Android 14 (API 34). Google Play Store requires at least API 34.`,
        descriptionId: `Target SDK (${project.targetSdk}) di bawah Android 14 (API 34). Google Play mensyaratkan minimal API 34.`,
        suggestedFix: 'Update targetSdk to 34 or 35 in project configuration.',
        suggestedFixId: 'Perbarui targetSdk ke 34 atau 35 pada konfigurasi proyek.',
      });
    }

    // 6. Sensitive Files Warning
    if (sensitiveFiles.length > 0) {
      issues.push({
        severity: 'warning',
        field: 'security',
        description: `Found ${sensitiveFiles.length} potentially sensitive file(s) in the workspace directory.`,
        descriptionId: `Ditemukan ${sensitiveFiles.length} berkas yang berpotensi sensitif di direktori proyek.`,
        suggestedFix: 'Verify .gitignore and do not bundle sensitive keys into exported public artifacts.',
        suggestedFixId: 'Periksa .gitignore dan jangan sertakan kunci privat ke dalam artefak publik.',
      });
    }

    const errorsCount = issues.filter((i) => i.severity === 'error').length;
    const warningsCount = issues.filter((i) => i.severity === 'warning').length;

    return {
      isBlocked: errorsCount > 0,
      hasWarnings: warningsCount > 0,
      errorsCount,
      warningsCount,
      sensitiveFiles,
      issues,
    };
  }

  /**
   * Generates standard initial production checklist items
   */
  public static createDefaultChecklist(): ProductionChecklistItem[] {
    return [
      {
        id: 'chk_app_name',
        label: 'App name verified',
        labelId: 'Nama aplikasi telah diverifikasi',
        description: 'Display name matches branding and store listing.',
        descriptionId: 'Nama tampilan sesuai dengan merek dan listing Google Play.',
        category: 'identity',
        checked: false,
        isAutomated: false,
      },
      {
        id: 'chk_pkg_id',
        label: 'Package ID verified',
        labelId: 'Package ID telah diverifikasi',
        description: 'Application ID is unique, lowercase, and matches company domain.',
        descriptionId: 'ID Aplikasi unik, huruf kecil, dan sesuai domain perusahaan.',
        category: 'identity',
        checked: false,
        isAutomated: true,
      },
      {
        id: 'chk_version',
        label: 'Version & Build code verified',
        labelId: 'Nomor versi & kode build telah diverifikasi',
        description: 'Version Name follows SemVer and Version Code is strictly incremented.',
        descriptionId: 'Version Name mengikuti SemVer dan Version Code ditingkatkan.',
        category: 'version',
        checked: false,
        isAutomated: true,
      },
      {
        id: 'chk_app_icon',
        label: 'App icon & splash verified',
        labelId: 'Ikon aplikasi & splash screen telah diverifikasi',
        description: 'Adaptive launcher icon with safe-area guidelines tested.',
        descriptionId: 'Ikon adaptive launcher dengan safe-area telah diuji.',
        category: 'quality',
        checked: false,
        isAutomated: false,
      },
      {
        id: 'chk_signing',
        label: 'Release signing keystore verified',
        labelId: 'Keystore penandatanganan rilis telah diverifikasi',
        description: 'Official RSA-2048 production keystore configured with V1 & V2 signatures.',
        descriptionId: 'Keystore produksi RSA-2048 resmi dikonfigurasi dengan skema V1 & V2.',
        category: 'signing',
        checked: false,
        isAutomated: true,
      },
      {
        id: 'chk_debug_disabled',
        label: 'Debug mode disabled',
        labelId: 'Mode debug dinonaktifkan',
        description: 'android:debuggable is false and logging is optimized.',
        descriptionId: 'android:debuggable bernilai false dan logging dioptimalkan.',
        category: 'security',
        checked: false,
        isAutomated: true,
      },
      {
        id: 'chk_test_ads',
        label: 'Test ads reviewed',
        labelId: 'Iklan uji telah ditinjau',
        description: 'Test AdMob IDs switched to real production IDs (or disabled).',
        descriptionId: 'ID iklan uji beralih ke ID produksi resmi (atau dinonaktifkan).',
        category: 'quality',
        checked: false,
        isAutomated: false,
      },
      {
        id: 'chk_api_endpoints',
        label: 'API endpoints reviewed',
        labelId: 'Endpoint API telah ditinjau',
        description: 'Production base URL uses HTTPS without development hardcoded tokens.',
        descriptionId: 'Base URL produksi menggunakan HTTPS tanpa token pengembangan.',
        category: 'network',
        checked: false,
        isAutomated: false,
      },
      {
        id: 'chk_privacy',
        label: 'Privacy policy & permissions reviewed',
        labelId: 'Kebijakan privasi & izin Android ditinjau',
        description: 'Permissions declared in manifest are strictly required by features.',
        descriptionId: 'Izin yang dideklarasikan di manifest benar-benar dibutuhkan aplikasi.',
        category: 'security',
        checked: false,
        isAutomated: false,
      },
      {
        id: 'chk_device_tested',
        label: 'Release build tested on real device',
        labelId: 'Build rilis telah diuji pada perangkat fisik',
        description: 'Release APK installed and smoke-tested on Android phone.',
        descriptionId: 'Release APK dipasang dan diuji fungsionalitasnya pada ponsel Android.',
        category: 'quality',
        checked: false,
        isAutomated: false,
      },
    ];
  }
}
