/**
 * Nusantara App Builder - Pre-Build Project Validator
 * Phase 7: Three levels of validation (Quick, Full, Build Validation)
 * preventing build failures early with actionable suggested fixes.
 */

import { ValidationLevel } from '../types';
import { ProjectMetadata, ProjectFile } from '../../../types/project';
import { validatePackageId } from '../../../validation/projectValidator';

export interface PreBuildIssue {
  severity: 'error' | 'warning' | 'info';
  file?: string;
  line?: number;
  description: string;
  descriptionId: string;
  suggestedFix: string;
  suggestedFixId: string;
}

export interface PreBuildValidationResult {
  level: ValidationLevel;
  isValid: boolean;
  isBlocked: boolean;
  timestamp: string;
  issues: PreBuildIssue[];
  summary: {
    errorsCount: number;
    warningsCount: number;
    filesCheckedCount: number;
  };
}

export class ProjectBuildValidator {
  /**
   * Performs validation according to specified level
   */
  public static validate(
    project: ProjectMetadata,
    files: ProjectFile[],
    level: ValidationLevel = 'quick'
  ): PreBuildValidationResult {
    const issues: PreBuildIssue[] = [];
    const filesChecked = new Set<string>();

    // 1. Package ID Validation (Quick, Full, Build)
    const pkgErrors = validatePackageId(project.packageId);
    if (pkgErrors.length > 0) {
      issues.push({
        severity: 'error',
        file: 'app/build.gradle.kts',
        line: 12,
        description: `Invalid Android Package Identifier: "${project.packageId}". ${pkgErrors[0].message}`,
        descriptionId: `Package ID Android tidak valid: "${project.packageId}". ${pkgErrors[0].messageId}`,
        suggestedFix: 'Package ID must have at least 2 segments and contain only alphanumeric/underscore characters (e.g. id.nusantara.app).',
        suggestedFixId: 'Package ID harus terdiri dari minimal 2 segmen dan hanya berisi huruf/angka/garis bawah (cth: id.nusantara.app).',
      });
    }

    // 2. Project Structure & Gradle files (Quick, Full, Build)
    const requiredFiles = [
      'settings.gradle.kts',
      'build.gradle.kts',
      'app/build.gradle.kts',
      'app/src/main/AndroidManifest.xml',
    ];

    for (const req of requiredFiles) {
      filesChecked.add(req);
      const exists = files.some((f) => f.path.replace(/\\/g, '/') === req);
      if (!exists) {
        issues.push({
          severity: 'error',
          file: req,
          line: 1,
          description: `Required Android build configuration file is missing: ${req}`,
          descriptionId: `Berkas konfigurasi build Android penting tidak ditemukan: ${req}`,
          suggestedFix: 'Re-generate project template files or restore from repository backup.',
          suggestedFixId: 'Buat ulang berkas template proyek atau pulihkan dari cadangan.',
        });
      }
    }

    // 3. AndroidManifest.xml validation (Quick, Full, Build)
    const manifest = files.find((f) => f.path.replace(/\\/g, '/').endsWith('AndroidManifest.xml'));
    if (manifest) {
      filesChecked.add(manifest.path);
      const content = manifest.content;

      if (!content.includes('<manifest') || !content.includes('</manifest>')) {
        issues.push({
          severity: 'error',
          file: manifest.path,
          line: 1,
          description: 'Malformed AndroidManifest.xml: Root <manifest> element is missing or unclosed.',
          descriptionId: 'AndroidManifest.xml rusak: Elemen induk <manifest> tidak ditemukan atau tidak ditutup.',
          suggestedFix: 'Ensure AndroidManifest.xml has valid XML structure with root <manifest> tag.',
          suggestedFixId: 'Pastikan AndroidManifest.xml memiliki struktur XML valid dengan tag <manifest>.',
        });
      }

      if (!content.includes('<application') || !content.includes('</application>')) {
        issues.push({
          severity: 'error',
          file: manifest.path,
          line: 5,
          description: 'Malformed AndroidManifest.xml: <application> tag is missing.',
          descriptionId: 'AndroidManifest.xml rusak: Tag <application> tidak ditemukan.',
          suggestedFix: 'Add <application> block with label, icon, and registered activities.',
          suggestedFixId: 'Tambahkan blok <application> dengan label, ikon, dan aktivitas terdaftar.',
        });
      }

      // Android 12+ requires android:exported explicitly on intent-filter activities
      if (content.includes('android.intent.action.MAIN') && !content.includes('android:exported=')) {
        issues.push({
          severity: 'error',
          file: manifest.path,
          line: 14,
          description: 'Android 12+ (API 31+) requires explicit android:exported="true|false" on activities with intent filters.',
          descriptionId: 'Android 12+ (API 31+) mewajibkan android:exported="true|false" eksplisit pada aktivitas dengan intent-filter.',
          suggestedFix: 'Add android:exported="true" to the launcher Activity in AndroidManifest.xml.',
          suggestedFixId: 'Tambahkan atribut android:exported="true" pada Activity launcher di AndroidManifest.xml.',
        });
      }
    }

    // 4. SDK Levels verification
    if (project.minSdk < 21) {
      issues.push({
        severity: 'warning',
        file: 'app/build.gradle.kts',
        line: 15,
        description: `minSdk (${project.minSdk}) is lower than API 21 (Android 5.0). Some modern Android features may be restricted.`,
        descriptionId: `minSdk (${project.minSdk}) lebih rendah dari API 21. Sebagian fitur Android modern mungkin terbatas.`,
        suggestedFix: 'Consider bumping minSdk to 24 (Android 7.0) for better compatibility.',
        suggestedFixId: 'Disarankan menaikkan minSdk ke 24 (Android 7.0) demi kompatibilitas modern.',
      });
    }

    if (project.targetSdk < 34) {
      issues.push({
        severity: 'warning',
        file: 'app/build.gradle.kts',
        line: 16,
        description: `targetSdk (${project.targetSdk}) is below Android 14 (API 34). Google Play requires at least API 34.`,
        descriptionId: `targetSdk (${project.targetSdk}) di bawah Android 14 (API 34). Google Play mensyaratkan minimal API 34.`,
        suggestedFix: 'Update targetSdk to 34 or 35 in project configuration.',
        suggestedFixId: 'Perbarui targetSdk ke 34 atau 35 pada konfigurasi proyek.',
      });
    }

    // 5. Extended Checks for Full and Build Validation Levels
    if (level === 'full' || level === 'build') {
      // Check Kotlin / Java Source files
      const sourceFiles = files.filter((f) => f.path.endsWith('.kt') || f.path.endsWith('.java'));
      if (sourceFiles.length === 0) {
        issues.push({
          severity: 'error',
          file: 'app/src/main/java',
          description: 'No Java or Kotlin source code files found in the project.',
          descriptionId: 'Tidak ditemukan berkas kode sumber Java atau Kotlin di proyek ini.',
          suggestedFix: 'Add at least one Activity class (e.g. MainActivity.kt).',
          suggestedFixId: 'Tambahkan minimal satu kelas Activity (cth: MainActivity.kt).',
        });
      }

      // Check XML Resources
      const stringRes = files.find((f) => f.path.replace(/\\/g, '/').endsWith('strings.xml'));
      if (!stringRes) {
        issues.push({
          severity: 'warning',
          file: 'app/src/main/res/values/strings.xml',
          description: 'Missing strings.xml resource file. Hardcoded strings may trigger lint warnings.',
          descriptionId: 'Berkas strings.xml tidak ditemukan. String langsung dapat memicu peringatan lint.',
          suggestedFix: 'Create app/src/main/res/values/strings.xml with app_name string.',
          suggestedFixId: 'Buat app/src/main/res/values/strings.xml dengan string app_name.',
        });
      }

      // Check Gradle Wrapper binary
      const hasGradleWrapper = files.some((f) => f.path.replace(/\\/g, '/').includes('gradlew'));
      if (!hasGradleWrapper) {
        issues.push({
          severity: 'warning',
          file: 'gradlew.bat',
          description: 'Gradle wrapper script (gradlew / gradlew.bat) is not in the project root.',
          descriptionId: 'Skrip wrapper Gradle (gradlew / gradlew.bat) tidak ditemukan di root proyek.',
          suggestedFix: 'Ensure gradlew and gradle/wrapper/ directory are present.',
          suggestedFixId: 'Pastikan gradlew dan folder gradle/wrapper/ tersedia.',
        });
      }
    }

    const errorsCount = issues.filter((i) => i.severity === 'error').length;
    const warningsCount = issues.filter((i) => i.severity === 'warning').length;
    const isBlocked = errorsCount > 0;

    return {
      level,
      isValid: errorsCount === 0,
      isBlocked,
      timestamp: new Date().toISOString(),
      issues,
      summary: {
        errorsCount,
        warningsCount,
        filesCheckedCount: filesChecked.size || files.length,
      },
    };
  }
}
