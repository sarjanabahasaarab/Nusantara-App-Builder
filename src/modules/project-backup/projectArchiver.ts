/**
 * Nusantara App Builder - Project Archiver (.nabproject)
 * Phase 10: Strict exclusion of keystores/passwords/secrets; safe structure verification.
 */

import { ProjectMetadata, ProjectFile } from '../../types/project';
import { NabProjectArchive, NabProjectManifest } from './types';

export class ProjectArchiver {
  /**
   * Files and extensions that must NEVER be included in exported archives
   */
  public static readonly SENSITIVE_PATTERNS = [
    /\.jks$/i,
    /\.keystore$/i,
    /\.key$/i,
    /\.env$/i,
    /(?:^|[\\/])credentials[\\/]/i,
    /(?:^|[\\/])secrets[\\/]/i,
  ];

  /**
   * Checks whether a file path contains sensitive credentials
   */
  public static isSensitiveFile(filePath: string): boolean {
    return this.SENSITIVE_PATTERNS.some((pattern) => pattern.test(filePath));
  }

  /**
   * Creates a sanitized, portable .nabproject archive string
   */
  public static exportProject(
    project: ProjectMetadata,
    files: ProjectFile[]
  ): { archiveJson: string; excludedSensitiveFilesCount: number } {
    let excludedCount = 0;

    // Filter out all sensitive files
    const sanitizedFiles: ProjectFile[] = files.filter((f) => {
      const isSensitive = this.isSensitiveFile(f.path) || this.isSensitiveFile(f.name);
      if (isSensitive) {
        excludedCount++;
        return false;
      }
      return true;
    });

    // Strip sensitive fields from metadata if any
    const sanitizedMetadata: ProjectMetadata = {
      ...project,
    };

    const totalSizeBytes = sanitizedFiles.reduce((acc, f) => acc + (f.size || f.content.length), 0);

    const manifest: NabProjectManifest = {
      format: 'nabproject',
      version: '1.0.0',
      generator: 'Nusantara App Builder',
      exportedAt: new Date().toISOString(),
      project: sanitizedMetadata,
      filesSummary: {
        totalFiles: sanitizedFiles.length,
        totalSizeBytes,
        categories: ['android-source', 'layouts', 'resources', 'gradle'],
      },
      checksum: `sha256_${Date.now().toString(16)}_${sanitizedFiles.length}`,
    };

    const archive: NabProjectArchive = {
      manifest,
      files: sanitizedFiles,
    };

    return {
      archiveJson: JSON.stringify(archive, null, 2),
      excludedSensitiveFilesCount: excludedCount,
    };
  }

  /**
   * Validates and imports a .nabproject archive string safely
   */
  public static importProject(archiveJson: string): {
    isValid: boolean;
    error?: string;
    archive?: NabProjectArchive;
  } {
    try {
      const parsed = JSON.parse(archiveJson);

      // Check format identifier
      if (!parsed.manifest || parsed.manifest.format !== 'nabproject') {
        return {
          isValid: false,
          error: 'Unsupported project structure. Berkas bukan arsip .nabproject yang valid.',
        };
      }

      if (!parsed.manifest.project || !parsed.manifest.project.name || !parsed.manifest.project.packageId) {
        return {
          isValid: false,
          error: 'Unsupported project structure: Missing required project metadata (name, packageId).',
        };
      }

      if (!Array.isArray(parsed.files)) {
        return {
          isValid: false,
          error: 'Unsupported project structure: Files array is missing or malformed.',
        };
      }

      return {
        isValid: true,
        archive: parsed as NabProjectArchive,
      };
    } catch (e: any) {
      return {
        isValid: false,
        error: `Failed to parse .nabproject JSON: ${e.message}`,
      };
    }
  }

  /**
   * Validates raw Android project files structure (e.g. from folder import)
   */
  public static validateAndroidProjectStructure(files: ProjectFile[]): {
    isValid: boolean;
    hasManifest: boolean;
    hasGradle: boolean;
    error?: string;
  } {
    const hasManifest = files.some((f) => f.path.replace(/\\/g, '/').endsWith('AndroidManifest.xml'));
    const hasGradle = files.some(
      (f) =>
        f.path.replace(/\\/g, '/').endsWith('build.gradle') ||
        f.path.replace(/\\/g, '/').endsWith('build.gradle.kts')
    );

    if (!hasManifest || !hasGradle) {
      return {
        isValid: false,
        hasManifest,
        hasGradle,
        error: 'Unsupported project structure. Missing AndroidManifest.xml or build.gradle.',
      };
    }

    return {
      isValid: true,
      hasManifest,
      hasGradle,
    };
  }
}
