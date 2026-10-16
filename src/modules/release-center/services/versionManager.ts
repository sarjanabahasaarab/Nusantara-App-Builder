/**
 * Nusantara App Builder - Android Version Manager
 * Phase 8: SemVer parser, Version Code incrementation, and Android versioning rules.
 */

export interface VersionValidationResult {
  isValid: boolean;
  error?: string;
  errorId?: string;
}

export class VersionManager {
  /**
   * Validates Version Name (e.g. 1.0.0 or 1.0.0-rc1)
   */
  public static validateVersionName(versionName: string): VersionValidationResult {
    const trimmed = versionName.trim();
    if (!trimmed) {
      return {
        isValid: false,
        error: 'Version Name cannot be empty.',
        errorId: 'Nama Versi (Version Name) tidak boleh kosong.',
      };
    }

    // Standard Semantic Versioning or Android dot notation: 1.0, 1.0.0, 1.0.0.1, 1.0.0-beta
    const semverRegex = /^[0-9]+(\.[0-9]+)+(-[a-zA-Z0-9.]+)?$/;
    if (!semverRegex.test(trimmed)) {
      return {
        isValid: false,
        error: 'Version Name must follow dot-separated format (e.g. 1.0.0 or 2.1.0-release).',
        errorId: 'Nama Versi harus mengikuti format bertitik (misal: 1.0.0 atau 2.1.0-release).',
      };
    }

    return { isValid: true };
  }

  /**
   * Validates Version Code (must be positive integer between 1 and 2,100,000,000)
   */
  public static validateVersionCode(versionCode: number, currentDeployedCode?: number): VersionValidationResult {
    if (!Number.isInteger(versionCode) || versionCode < 1) {
      return {
        isValid: false,
        error: 'Version Code must be a positive integer greater than or equal to 1.',
        errorId: 'Kode Versi (Version Code) harus berupa bilangan bulat positif >= 1.',
      };
    }

    // Google Play max version code limit is 2,100,000,000
    if (versionCode > 2_100_000_000) {
      return {
        isValid: false,
        error: 'Version Code cannot exceed 2,100,000,000 (Google Play maximum limit).',
        errorId: 'Kode Versi tidak boleh melebihi 2.100.000.000 (batas maksimal Google Play).',
      };
    }

    if (currentDeployedCode !== undefined && versionCode <= currentDeployedCode) {
      return {
        isValid: false,
        error: `Version Code (${versionCode}) must be strictly greater than previous release code (${currentDeployedCode}).`,
        errorId: `Kode Versi (${versionCode}) harus lebih besar dari kode rilis sebelumnya (${currentDeployedCode}).`,
      };
    }

    return { isValid: true };
  }

  /**
   * Increments the patch version (e.g. 1.0.0 -> 1.0.1)
   */
  public static incrementPatch(versionName: string): string {
    const parts = this.parseVersionParts(versionName);
    parts[2] = (parts[2] || 0) + 1;
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }

  /**
   * Increments the minor version (e.g. 1.0.1 -> 1.1.0)
   */
  public static incrementMinor(versionName: string): string {
    const parts = this.parseVersionParts(versionName);
    parts[1] = (parts[1] || 0) + 1;
    parts[2] = 0;
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }

  /**
   * Increments the major version (e.g. 1.1.0 -> 2.0.0)
   */
  public static incrementMajor(versionName: string): string {
    const parts = this.parseVersionParts(versionName);
    parts[0] = (parts[0] || 0) + 1;
    parts[1] = 0;
    parts[2] = 0;
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }

  /**
   * Increments the version code integer (+1)
   */
  public static incrementVersionCode(currentCode: number): number {
    return Math.max(1, currentCode + 1);
  }

  /**
   * Alias for incrementVersionCode
   */
  public static incrementBuildCode(currentCode: number): number {
    return this.incrementVersionCode(currentCode);
  }

  /**
   * Parses version string into numeric parts [major, minor, patch]
   */
  private static parseVersionParts(versionName: string): [number, number, number] {
    const clean = versionName.split('-')[0].trim();
    const segments = clean.split('.').map((s) => {
      const parsed = parseInt(s, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    });
    return [segments[0] !== undefined ? segments[0] : 1, segments[1] || 0, segments[2] || 0];
  }
}
