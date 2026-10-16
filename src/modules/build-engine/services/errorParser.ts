/**
 * Nusantara App Builder - Gradle Output & Error Parser
 * Phase 7: Intelligently parses Kotlin, Java, AAPT2, and Manifest compiler errors,
 * extracting task name, file name, line number, column, and actionable suggested fixes.
 */

import { ParsedGradleError } from '../types';

export class ErrorParser {
  /**
   * Scans an array of Gradle logs and extracts structured compilation/build errors
   */
  public static parseGradleErrors(logs: string[]): ParsedGradleError | null {
    const fullLog = logs.join('\n');

    // 1. Kotlin / Java Compiler Error pattern:
    // e: /path/to/MainActivity.kt: (42, 12): Unresolved reference: xyz
    // or: C:\path\MainActivity.kt:42: error: cannot find symbol
    const kotlinMatch = fullLog.match(/(?:e:\s+)?([a-zA-Z0-9_\-./\\]+\.(?:kt|java)):\s*(?:\(?(\d+)(?:,\s*(\d+)\)?)?):?\s*(?:error:\s*)?(.+)/);
    if (kotlinMatch) {
      const filePath = kotlinMatch[1];
      const line = parseInt(kotlinMatch[2], 10);
      const col = kotlinMatch[3] ? parseInt(kotlinMatch[3], 10) : undefined;
      const message = kotlinMatch[4]?.trim() || 'Compilation failed';

      let suggestedFix = 'Check the syntax, verify imported packages, or review variable types.';
      let suggestedFixId = 'Periksa sintaksis kode, pastikan paket telah diimpor, atau periksa tipe variabel.';

      if (message.includes('Unresolved reference')) {
        const refName = message.split('Unresolved reference:')[1]?.trim() || '';
        suggestedFix = `Import the missing class or declare variable/function "${refName}".`;
        suggestedFixId = `Impor kelas yang hilang atau deklarasikan variabel/fungsi "${refName}".`;
      } else if (message.includes('Type mismatch')) {
        suggestedFix = 'Ensure matching types or perform explicit casting.';
        suggestedFixId = 'Pastikan tipe data cocok atau lakukan casting eksplisit.';
      }

      return {
        task: ':app:compileDebugKotlin',
        file: filePath,
        line,
        column: col,
        message,
        errorType: 'kotlin',
        suggestedFix,
        suggestedFixId,
      };
    }

    // 2. AAPT2 / XML Resource Error pattern:
    // /path/app/src/main/res/layout/activity_main.xml:14: AAPT: error: resource ... not found
    const aaptMatch = fullLog.match(/([a-zA-Z0-9_\-./\\]+\.xml):(\d+):\s*AAPT:\s*(?:error:\s*)?(.+)/);
    if (aaptMatch) {
      return {
        task: ':app:processDebugResources',
        file: aaptMatch[1],
        line: parseInt(aaptMatch[2], 10),
        message: aaptMatch[3].trim(),
        errorType: 'aapt2',
        suggestedFix: 'Verify XML attribute names, namespaces (xmlns:android), and referenced resource IDs in res/.',
        suggestedFixId: 'Periksa nama atribut XML, namespace (xmlns:android), dan ID resource yang dirujuk pada folder res/.',
      };
    }

    // 3. AndroidManifest Merger Error pattern:
    if (fullLog.includes('Manifest merger failed') || fullLog.includes(':app:processDebugMainManifest')) {
      const manifestLineMatch = fullLog.match(/AndroidManifest\.xml:(\d+):/);
      return {
        task: ':app:processDebugMainManifest',
        file: 'app/src/main/AndroidManifest.xml',
        line: manifestLineMatch ? parseInt(manifestLineMatch[1], 10) : 1,
        message: 'Manifest merger failed with multiple errors.',
        errorType: 'manifest',
        suggestedFix: 'Ensure activity and service components declare android:exported="true|false" and no duplicated permissions exist.',
        suggestedFixId: 'Pastikan komponen activity dan service menyertakan android:exported="true|false" dan tidak ada izin ganda.',
      };
    }

    // 4. Missing Android SDK Platform / Build-Tools
    if (fullLog.includes('Failed to find Build Tools') || fullLog.includes('Platform not installed') || fullLog.includes('SDK location not found')) {
      return {
        task: ':app:preBuild',
        message: 'Android SDK or required Platform/Build-Tools not found on system.',
        errorType: 'sdk',
        suggestedFix: 'Install required Android SDK Platform and Build Tools via Settings or SDK Manager.',
        suggestedFixId: 'Pasang Android SDK Platform dan Build Tools yang dibutuhkan melalui menu Pengaturan atau SDK Manager.',
      };
    }

    // 5. Release Signing Error
    if (fullLog.includes('SigningConfig') || fullLog.includes('keystore') || fullLog.includes('validateSigningRelease')) {
      return {
        task: ':app:validateSigningRelease',
        message: 'Release signing keystore is not configured or password is incorrect.',
        errorType: 'signing',
        suggestedFix: 'Configure release signing in Signing Manager or provide a valid .jks/.keystore file.',
        suggestedFixId: 'Konfigurasikan signing rilis pada Signing Manager atau sediakan berkas .jks/.keystore yang valid.',
      };
    }

    // 6. Generic Gradle Execution Failure
    const failedTaskMatch = fullLog.match(/Execution failed for task '([^']+)'/);
    if (failedTaskMatch) {
      return {
        task: failedTaskMatch[1],
        message: `Task execution failed at ${failedTaskMatch[1]}.`,
        errorType: 'gradle',
        suggestedFix: 'Review task logs with --stacktrace or run Clean Project before rebuilding.',
        suggestedFixId: 'Tinjau log tugas dengan --stacktrace atau jalankan Bersihkan Proyek sebelum membangun ulang.',
      };
    }

    return null;
  }
}
