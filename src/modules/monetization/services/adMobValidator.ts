/**
 * Nusantara App Builder - AdMob Validator & Monetization Diagnostics
 * Phase 9: AdMob App ID format validation, Ad Unit ID verification,
 * Test vs Production environment check, Privacy Policy validation, and Diagnostics.
 */

import {
  AdMobConfig,
  AdUnitConfig,
  MonetizationDiagnosticReport,
  MonetizationDiagnosticItem,
  OFFICIAL_GOOGLE_TEST_IDS,
} from '../types';
import { ProjectMetadata, ProjectFile } from '../../../types/project';

export interface ValidationResult {
  isValid: boolean;
  isTestId: boolean;
  error?: string;
  errorId?: string;
}

export class AdMobValidator {
  /**
   * AdMob Android App ID format: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
   * where X is usually 16 digits and Y is 10 digits
   */
  public static readonly APP_ID_REGEX = /^ca-app-pub-[0-9]{16}~[0-9]{10}$/;

  /**
   * AdMob Android Ad Unit ID format: ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY
   * where X is usually 16 digits and Y is 10 digits
   */
  public static readonly AD_UNIT_REGEX = /^ca-app-pub-[0-9]{16}\/[0-9]{10}$/;

  /**
   * Validates AdMob App ID
   */
  public static validateAppId(appId: string): ValidationResult {
    const trimmed = appId.trim();
    if (!trimmed) {
      return {
        isValid: false,
        isTestId: false,
        error: 'AdMob App ID cannot be empty.',
        errorId: 'AdMob App ID tidak boleh kosong.',
      };
    }

    const isTest = trimmed === OFFICIAL_GOOGLE_TEST_IDS.appId;

    if (!this.APP_ID_REGEX.test(trimmed)) {
      return {
        isValid: false,
        isTestId: isTest,
        error: 'Invalid AdMob App ID format. Must follow "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY" (16 digits ~ 10 digits).',
        errorId: 'Format AdMob App ID tidak valid. Harus mengikuti "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY" (16 digit ~ 10 digit).',
      };
    }

    return { isValid: true, isTestId: isTest };
  }

  /**
   * Validates Ad Unit ID
   */
  public static validateAdUnitId(adUnitId: string): ValidationResult {
    const trimmed = adUnitId.trim();
    if (!trimmed) {
      return {
        isValid: false,
        isTestId: false,
        error: 'Ad Unit ID cannot be empty.',
        errorId: 'Ad Unit ID tidak boleh kosong.',
      };
    }

    const testIdValues = Object.values(OFFICIAL_GOOGLE_TEST_IDS);
    const isTest = testIdValues.includes(trimmed as any);

    if (!this.AD_UNIT_REGEX.test(trimmed)) {
      return {
        isValid: false,
        isTestId: isTest,
        error: 'Invalid Ad Unit ID format. Must follow "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY" (16 digits / 10 digits).',
        errorId: 'Format Ad Unit ID tidak valid. Harus mengikuti "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY" (16 digit / 10 digit).',
      };
    }

    return { isValid: true, isTestId: isTest };
  }

  /**
   * Validates Privacy Policy URL
   */
  public static validatePrivacyPolicyUrl(url?: string): { isValid: boolean; isHttps: boolean; error?: string; errorId?: string } {
    if (!url || !url.trim()) {
      return {
        isValid: false,
        isHttps: false,
        error: 'Privacy Policy URL is missing.',
        errorId: 'URL Kebijakan Privasi belum diisi.',
      };
    }

    const trimmed = url.trim();
    const isHttps = trimmed.toLowerCase().startsWith('https://');
    const isHttp = trimmed.toLowerCase().startsWith('http://');

    if (!isHttps && !isHttp) {
      return {
        isValid: false,
        isHttps: false,
        error: 'Privacy Policy URL must start with https://.',
        errorId: 'URL Kebijakan Privasi harus diawali dengan https://.',
      };
    }

    if (!isHttps) {
      return {
        isValid: false,
        isHttps: false,
        error: 'Privacy Policy URL must use secure HTTPS protocol.',
        errorId: 'URL Kebijakan Privasi wajib menggunakan protokol HTTPS yang aman.',
      };
    }

    return { isValid: true, isHttps: true };
  }

  /**
   * Performs full Monetization Diagnostics scan
   */
  public static runDiagnostics(
    config: AdMobConfig,
    project: ProjectMetadata,
    files: ProjectFile[],
    buildProfileType: 'debug' | 'release' | 'production' = 'release'
  ): MonetizationDiagnosticReport {
    const items: MonetizationDiagnosticItem[] = [];

    // If AdMob is disabled, produce an informational report
    if (!config.enabled) {
      items.push({
        id: 'diag_admob_disabled',
        severity: 'info',
        category: 'appid',
        title: 'AdMob Monetization Disabled',
        titleId: 'Monetisasi AdMob Dinonaktifkan',
        problem: 'AdMob is turned off for this project.',
        problemId: 'AdMob dalam status tidak aktif untuk proyek ini.',
        cause: 'The enable toggle is set to false in AdMob Center.',
        causeId: 'Toggle aktifkan bernilai false pada AdMob Center.',
        suggestedFix: 'Enable AdMob in AdMob Center if you plan to monetize with ads.',
        suggestedFixId: 'Aktifkan AdMob pada AdMob Center jika Anda ingin memonetisasi aplikasi dengan iklan.',
      });

      return {
        isBlocked: false,
        errorsCount: 0,
        warningsCount: 0,
        infoCount: 1,
        items,
        timestamp: new Date().toISOString(),
      };
    }

    // 1. App ID Check
    const appIdRes = this.validateAppId(config.appId);
    if (!appIdRes.isValid) {
      items.push({
        id: 'diag_appid_invalid',
        severity: 'error',
        category: 'appid',
        title: 'Invalid AdMob App ID',
        titleId: 'AdMob App ID Tidak Valid',
        problem: appIdRes.error || 'Invalid App ID',
        problemId: appIdRes.errorId || 'Format App ID tidak valid',
        cause: 'The specified App ID does not conform to the ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY pattern.',
        causeId: 'App ID yang dimasukkan tidak sesuai format pola ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY.',
        suggestedFix: 'Configure your real App ID from Google AdMob Console or click "Use Official Test IDs".',
        suggestedFixId: 'Atur App ID asli dari Konsol Google AdMob atau klik "Gunakan Test IDs Resmi".',
      });
    } else if (appIdRes.isTestId && config.environment === 'production') {
      items.push({
        id: 'diag_appid_test_in_prod',
        severity: 'warning',
        category: 'appid',
        title: 'Test App ID in Production Mode',
        titleId: 'Test App ID Digunakan di Mode Produksi',
        problem: 'Google sample test App ID is configured while Environment is set to Production.',
        problemId: 'App ID contoh pengujian Google digunakan padahal Lingkungan diatur ke Produksi.',
        cause: 'Using sample ID ca-app-pub-3940256099942544~3347511713.',
        causeId: 'Menggunakan ID contoh pengujian ca-app-pub-3940256099942544~3347511713.',
        suggestedFix: 'Replace the sample App ID with your genuine AdMob App ID before publishing.',
        suggestedFixId: 'Ganti App ID contoh dengan App ID asli Anda sebelum merilis aplikasi ke publik.',
      });
    }

    // Check test environment in production build profile
    if (buildProfileType === 'production' && config.environment === 'test') {
      items.push({
        id: 'diag_test_env_in_production_profile',
        severity: 'error',
        category: 'environment',
        title: 'AdMob Test Environment in Production Profile',
        titleId: 'Lingkungan Uji AdMob pada Profil Produksi',
        problem: 'AdMob configuration is set to Test Mode while building with the Production profile.',
        problemId: 'Konfigurasi AdMob diatur ke mode Test saat melakukan build profil Produksi.',
        cause: 'Building for release/production requires production environment.',
        causeId: 'Kompilasi produksi mewajibkan lingkungan mode produksi.',
        suggestedFix: 'Switch to Production Mode in AdMob Center before finalizing release.',
        suggestedFixId: 'Alihkan ke Mode Produksi pada AdMob Center sebelum menyelesaikan rilis.',
      });
    }

    // 2. Ad Units Checks
    if (config.units.length === 0) {
      items.push({
        id: 'diag_no_ad_units',
        severity: 'warning',
        category: 'adunits',
        title: 'No Ad Units Configured',
        titleId: 'Belum Ada Ad Unit yang Dikonfigurasi',
        problem: 'AdMob is enabled, but no Ad Units (Banner, Interstitial, Rewarded, or Native) are defined.',
        problemId: 'AdMob aktif, namun belum ada Ad Unit yang dibuat.',
        cause: 'The Ad Units list is empty.',
        causeId: 'Daftar unit iklan masih kosong.',
        suggestedFix: 'Add at least one Banner, Interstitial, or Rewarded ad unit in the Ad Units tab.',
        suggestedFixId: 'Tambahkan minimal satu unit Banner, Interstisial, atau Berhadiah pada tab Ad Units.',
      });
    } else {
      const seenIds = new Set<string>();
      for (const unit of config.units) {
        if (!unit.enabled) continue;

        const unitRes = this.validateAdUnitId(unit.adUnitId);
        if (!unitRes.isValid) {
          items.push({
            id: `diag_unit_${unit.id}_invalid`,
            severity: 'error',
            category: 'adunits',
            title: `Invalid Ad Unit ID: ${unit.name}`,
            titleId: `Ad Unit ID Tidak Valid: ${unit.name}`,
            problem: unitRes.error || 'Invalid Ad Unit ID format',
            problemId: unitRes.errorId || 'Format Ad Unit ID tidak valid',
            cause: `Ad unit "${unit.name}" has invalid identifier: ${unit.adUnitId}`,
            causeId: `Unit iklan "${unit.name}" memiliki ID tidak valid: ${unit.adUnitId}`,
            suggestedFix: 'Ensure the unit follows ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY format.',
            suggestedFixId: 'Pastikan format unit mengikuti ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY.',
          });
        }

        // Check duplicates
        if (seenIds.has(unit.adUnitId)) {
          items.push({
            id: `diag_unit_${unit.id}_duplicate`,
            severity: 'warning',
            category: 'adunits',
            title: `Duplicate Ad Unit ID: ${unit.name}`,
            titleId: `Duplikasi Ad Unit ID: ${unit.name}`,
            problem: `Multiple active ad units share the identical Ad Unit ID: ${unit.adUnitId}`,
            problemId: `Beberapa unit iklan aktif menggunakan Ad Unit ID yang sama: ${unit.adUnitId}`,
            cause: 'Same ID assigned to multiple placements.',
            causeId: 'ID yang sama dipasang pada beberapa penempatan.',
            suggestedFix: 'AdMob recommends creating distinct ad units for separate screen placements for accurate reporting.',
            suggestedFixId: 'AdMob menyarankan membuat unit terpisah untuk setiap penempatan agar laporan analitik akurat.',
          });
        }
        seenIds.add(unit.adUnitId);

        // Production profile with test unit ID check
        if (buildProfileType === 'production' && unitRes.isTestId) {
          items.push({
            id: `diag_unit_${unit.id}_test_in_release`,
            severity: 'warning',
            category: 'environment',
            title: `Test Ad Unit in Production: ${unit.name}`,
            titleId: `Unit Iklan Pengujian pada Rilis Produksi: ${unit.name}`,
            problem: `Ad unit "${unit.name}" uses Google test ID in Production build profile.`,
            problemId: `Unit iklan "${unit.name}" menggunakan ID pengujian Google pada profil Produksi.`,
            cause: 'Test ID used in production profile.',
            causeId: 'ID pengujian dipakai di profil produksi.',
            suggestedFix: 'Replace with production Ad Unit ID from your AdMob account before store publishing.',
            suggestedFixId: 'Ganti dengan Ad Unit ID produksi dari akun AdMob Anda sebelum dipublikasikan ke toko aplikasi.',
          });
        }
      }
    }

    // 3. AndroidManifest.xml Check
    const manifest = files.find((f) => f.path.replace(/\\/g, '/').endsWith('AndroidManifest.xml'));
    if (manifest) {
      const hasAppIdMeta = manifest.content.includes('com.google.android.gms.ads.APPLICATION_ID');
      if (!hasAppIdMeta) {
        items.push({
          id: 'diag_manifest_missing_meta',
          severity: 'warning',
          category: 'manifest',
          title: 'AdMob Meta-Data Missing in AndroidManifest.xml',
          titleId: 'Meta-Data AdMob Belum Ada di AndroidManifest.xml',
          problem: 'AndroidManifest.xml does not yet declare com.google.android.gms.ads.APPLICATION_ID.',
          problemId: 'AndroidManifest.xml belum memuat deklarasi com.google.android.gms.ads.APPLICATION_ID.',
          cause: 'Generator has not yet synced AdMob to manifest.',
          causeId: 'Generator belum menyinkronkan AdMob ke manifest.',
          suggestedFix: 'Click "Save & Sync AdMob" in AdMob Center to automatically inject meta-data into AndroidManifest.xml.',
          suggestedFixId: 'Klik "Simpan & Sinkronisasi AdMob" pada AdMob Center untuk menambahkan meta-data secara otomatis.',
        });
      }
    }

    // 4. Gradle Dependency Check
    const gradle = files.find((f) => f.path.replace(/\\/g, '/').endsWith('build.gradle.kts') || f.path.endsWith('build.gradle'));
    if (gradle) {
      const hasAdsDependency = gradle.content.includes('play-services-ads');
      if (!hasAdsDependency) {
        items.push({
          id: 'diag_gradle_missing_dep',
          severity: 'warning',
          category: 'dependencies',
          title: 'Google Mobile Ads SDK Dependency Missing',
          titleId: 'Dependensi Google Mobile Ads SDK Belum Terpasang',
          problem: 'build.gradle does not include play-services-ads library.',
          problemId: 'build.gradle belum menyertakan library play-services-ads.',
          cause: 'Gradle configuration has not synced AdMob SDK dependency.',
          causeId: 'Konfigurasi Gradle belum menyinkronkan dependensi SDK AdMob.',
          suggestedFix: 'Click "Save & Sync AdMob" to automatically add play-services-ads dependency without duplicates.',
          suggestedFixId: 'Klik "Simpan & Sinkronisasi AdMob" untuk menambahkan dependensi play-services-ads tanpa duplikasi.',
        });
      }
    }

    // 5. Privacy Policy URL Check
    const privRes = this.validatePrivacyPolicyUrl(config.privacyPolicyUrl);
    if (!privRes.isValid) {
      items.push({
        id: 'diag_privacy_missing',
        severity: buildProfileType === 'production' ? 'warning' : 'info',
        category: 'privacy',
        title: 'Privacy Policy URL Recommended',
        titleId: 'URL Kebijakan Privasi Disarankan',
        problem: 'No Privacy Policy URL is configured for this app.',
        problemId: 'Belum ada URL Kebijakan Privasi yang dikonfigurasi.',
        cause: 'Privacy Policy URL field is empty in Consent & Privacy tab.',
        causeId: 'Field URL Kebijakan Privasi kosong pada tab Persetujuan & Privasi.',
        suggestedFix: 'Google Play requires all apps utilizing advertising to provide an accessible Privacy Policy URL.',
        suggestedFixId: 'Google Play mewajibkan seluruh aplikasi beriklan untuk menyediakan URL Kebijakan Privasi yang valid.',
      });
    } else if (!privRes.isHttps) {
      items.push({
        id: 'diag_privacy_not_https',
        severity: 'warning',
        category: 'privacy',
        title: 'Privacy Policy URL Should Use HTTPS',
        titleId: 'URL Kebijakan Privasi Sebaiknya Menggunakan HTTPS',
        problem: 'Privacy Policy URL uses plain HTTP instead of secure HTTPS.',
        problemId: 'URL Kebijakan Privasi menggunakan HTTP biasa daripada HTTPS aman.',
        cause: 'URL starts with http://.',
        causeId: 'URL diawali dengan http://.',
        suggestedFix: 'Change Privacy Policy URL to https:// for user security and Google Play approval.',
        suggestedFixId: 'Ubah URL Kebijakan Privasi ke https:// untuk keamanan pengguna dan persetujuan Google Play.',
      });
    }

    // 6. Website-to-App Overlap Check
    if (project.targetUrl && config.websitePlacement.enabled) {
      if (config.websitePlacement.placement === 'before_webview' || config.websitePlacement.placement === 'after_webview') {
        items.push({
          id: 'diag_web_overlap',
          severity: 'info',
          category: 'adunits',
          title: 'Native Banner Container in WebView App',
          titleId: 'Kontainer Banner Native pada Aplikasi WebView',
          problem: 'Ad placement is embedded into the native WebView activity container.',
          problemId: 'Penempatan iklan disematkan pada kontainer activity WebView native.',
          cause: 'Website-to-App container mode active.',
          causeId: 'Mode kontainer Website-to-App aktif.',
          suggestedFix: 'Ensure native ad container does not cover website navigation or action buttons.',
          suggestedFixId: 'Pastikan kontainer iklan native tidak menutupi tombol navigasi website.',
        });
      }
    }

    const errorsCount = items.filter((i) => i.severity === 'error').length;
    const warningsCount = items.filter((i) => i.severity === 'warning').length;
    const infoCount = items.filter((i) => i.severity === 'info').length;

    return {
      isBlocked: errorsCount > 0,
      errorsCount,
      warningsCount,
      infoCount,
      items,
      timestamp: new Date().toISOString(),
    };
  }
}
