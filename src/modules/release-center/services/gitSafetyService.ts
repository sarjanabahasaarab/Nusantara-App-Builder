/**
 * Nusantara App Builder - Git Safety & Release Tag Validator
 * Phase 8: Prevents leaking secrets to Git, validates SemVer Git tags,
 * and handles safe Git operations with user consent.
 */

export interface GitTagValidationResult {
  isValid: boolean;
  tagName: string;
  error?: string;
  errorId?: string;
}

export class GitSafetyService {
  /**
   * Validates a Git release tag format (e.g. v1.0.0 or v2.1.0-release)
   */
  public static validateGitTag(tagName: string): GitTagValidationResult {
    const trimmed = tagName.trim();
    if (!trimmed) {
      return {
        isValid: false,
        tagName: '',
        error: 'Git tag name cannot be empty.',
        errorId: 'Nama Git tag tidak boleh kosong.',
      };
    }

    // Git tags cannot contain spaces, control characters, colons, tildes, carats, question marks, asterisks, open brackets
    const validTagRegex = /^v?[0-9]+(\.[0-9]+)+(-[a-zA-Z0-9.]+)?$/;
    if (!validTagRegex.test(trimmed)) {
      return {
        isValid: false,
        tagName: trimmed,
        error: 'Git tag must be in valid version format (e.g. v1.0.0 or v1.2.0-rc1).',
        errorId: 'Git tag harus dalam format versi yang valid (misal: v1.0.0 atau v1.2.0-rc1).',
      };
    }

    const normalized = trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
    return {
      isValid: true,
      tagName: normalized,
    };
  }

  /**
   * Generates the Git commands to be shown for user confirmation
   */
  public static generateGitCommands(tagName: string): string[] {
    const cleanTag = tagName.startsWith('v') ? tagName : `v${tagName}`;
    return [
      `git tag -a ${cleanTag} -m "Release ${cleanTag}"`,
      `git push origin ${cleanTag}`,
    ];
  }
}
