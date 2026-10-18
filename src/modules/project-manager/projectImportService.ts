/**
 * Nusantara App Builder - Project Import Service (Phase 10)
 * Secure import for Nusantara Projects, native Android Gradle projects, and Community Templates.
 * Enforces strict manifest validation, path traversal prevention, and toolchain checks.
 */

import { ProjectMetadata, ProjectFile, CreateProjectInput } from '../../types/project';
import { COMPATIBLE_TOOLCHAIN } from './templates/commonAndroidFiles';

export interface AndroidImportAnalysis {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  extractedMetadata?: {
    appName: string;
    packageId: string;
    minSdk: number;
    targetSdk: number;
    compileSdk: number;
    hasKotlin: boolean;
    hasGradleKts: boolean;
    permissions: string[];
    activities: string[];
  };
}

export class ProjectImportService {
  /**
   * Safely inspects native Android project files for import into Nusantara App Builder.
   */
  public static analyzeAndroidProject(files: { path: string; content: string }[]): AndroidImportAnalysis {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Path traversal security check
    for (const f of files) {
      if (f.path.includes('..') || f.path.startsWith('/') || f.path.startsWith('\\')) {
        errors.push(`Security violation: Illegal relative path sequence in "${f.path}"`);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // 2. Locate AndroidManifest.xml
    const manifestFile = files.find(
      (f) =>
        f.path.toLowerCase().endsWith('androidmanifest.xml') ||
        f.path.toLowerCase().includes('src/main/androidmanifest.xml')
    );

    if (!manifestFile) {
      errors.push('Berkas AndroidManifest.xml tidak ditemukan pada struktur proyek.');
      return { isValid: false, errors, warnings };
    }

    // 3. Inspect AndroidManifest.xml
    const manifestContent = manifestFile.content;
    let packageId = 'com.example.importedapp';
    let appName = 'Imported Android App';
    const permissions: string[] = [];
    const activities: string[] = [];

    // Extract package / namespace
    const pkgMatch = manifestContent.match(/package\s*=\s*["']([^"']+)["']/);
    if (pkgMatch && pkgMatch[1]) {
      packageId = pkgMatch[1];
    }

    // Extract app label
    const labelMatch = manifestContent.match(/android:label\s*=\s*["']([^"']+)["']/);
    if (labelMatch && labelMatch[1] && !labelMatch[1].startsWith('@string/')) {
      appName = labelMatch[1];
    }

    // Extract permissions
    const permRegex = /<uses-permission[^>]+android:name=["']([^"']+)["']/g;
    let pMatch;
    while ((pMatch = permRegex.exec(manifestContent)) !== null) {
      permissions.push(pMatch[1].replace('android.permission.', ''));
    }

    // Extract activities
    const actRegex = /<activity[^>]+android:name=["']([^"']+)["']/g;
    let aMatch;
    while ((aMatch = actRegex.exec(manifestContent)) !== null) {
      activities.push(aMatch[1]);
    }

    // Check android:exported on activities with intent-filters (Android 12+ security)
    if (manifestContent.includes('<intent-filter>') && !manifestContent.includes('android:exported')) {
      warnings.push(
        'Komponen dengan <intent-filter> belum memiliki android:exported eksplisit (Wajib untuk Android 12+ / API 31+).'
      );
    }

    // 4. Locate build.gradle or build.gradle.kts
    const buildGradle = files.find(
      (f) =>
        f.path.toLowerCase().endsWith('build.gradle') ||
        f.path.toLowerCase().endsWith('build.gradle.kts')
    );

    let minSdk = 24;
    let targetSdk = 34;
    let compileSdk = 34;
    let hasKotlin = false;
    let hasGradleKts = false;

    if (buildGradle) {
      const bgContent = buildGradle.content;
      hasGradleKts = buildGradle.path.endsWith('.kts');
      hasKotlin = bgContent.includes('kotlin') || files.some((f) => f.path.endsWith('.kt'));

      const minSdkMatch = bgContent.match(/minSdk\s*(?:=)?\s*(\d+)/);
      if (minSdkMatch) minSdk = parseInt(minSdkMatch[1], 10);

      const targetSdkMatch = bgContent.match(/targetSdk\s*(?:=)?\s*(\d+)/);
      if (targetSdkMatch) targetSdk = parseInt(targetSdkMatch[1], 10);

      const compileSdkMatch = bgContent.match(/compileSdk\s*(?:=)?\s*(\d+)/);
      if (compileSdkMatch) compileSdk = parseInt(compileSdkMatch[1], 10);

      const nsMatch = bgContent.match(/namespace\s*=\s*["']([^"']+)["']/);
      if (nsMatch && nsMatch[1]) {
        packageId = nsMatch[1];
      }
    } else {
      warnings.push('Berkas build.gradle tidak ditemukan. Menggunakan konfigurasi toolchain standar Nusantara.');
    }

    if (minSdk < 21) {
      warnings.push(`minSdk ${minSdk} terdeteksi di bawah standar Android 5.0 (API 21). Disarankan memperbarui ke API 24+`);
    }

    return {
      isValid: true,
      errors,
      warnings,
      extractedMetadata: {
        appName,
        packageId,
        minSdk,
        targetSdk,
        compileSdk,
        hasKotlin,
        hasGradleKts,
        permissions,
        activities,
      },
    };
  }

  /**
   * Imports a valid Nusantara JSON project backup or metadata.
   */
  public static parseNusantaraProjectJson(jsonText: string): {
    success: boolean;
    metadata?: ProjectMetadata;
    files?: ProjectFile[];
    error?: string;
  } {
    try {
      const data = JSON.parse(jsonText);
      if (!data.name || !data.packageId) {
        return {
          success: false,
          error: 'Format berkas proyek Nusantara tidak valid. Kolom "name" atau "packageId" tidak ditemukan.',
        };
      }

      const metadata: ProjectMetadata = {
        id: data.id || `proj_${Date.now()}_import`,
        name: data.name,
        displayName: data.displayName || data.name,
        packageId: data.packageId,
        location: data.location || `C:\\Users\\Developer\\NusantaraProjects\\${data.name}`,
        description: data.description || 'Imported Nusantara Project',
        template: data.template || 'blank-app',
        language: 'kotlin',
        interfaceLanguage: data.interfaceLanguage || 'id',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        minSdk: data.minSdk || 26,
        targetSdk: data.targetSdk || 34,
        compileSdk: data.compileSdk || 34,
        versionCode: data.versionCode || 1,
        versionName: data.versionName || '1.0.0',
        formatVersion: '2.0',
      };

      const files: ProjectFile[] = Array.isArray(data.files) ? data.files : [];

      return {
        success: true,
        metadata,
        files,
      };
    } catch (e: any) {
      return {
        success: false,
        error: `Gagal membaca format JSON: ${e.message}`,
      };
    }
  }
}
