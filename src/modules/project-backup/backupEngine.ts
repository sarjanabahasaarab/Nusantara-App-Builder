/**
 * Nusantara App Builder - Backup & Restore Engine (.nabbackup)
 * Phase 10: Local-first automated snapshotting, integrity verification, and pre-restore guards.
 */

import { ProjectMetadata, ProjectFile } from '../../types/project';
import { ProjectArchiver } from './projectArchiver';
import { NabBackupRecord, NabProjectArchive, AutoBackupInterval } from './types';

const BACKUP_STORAGE_KEY = 'nab_project_backups';

export class BackupEngine {
  /**
   * Retrieves all local backup snapshots
   */
  public static getBackups(): NabBackupRecord[] {
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Creates a new .nabbackup snapshot
   */
  public static createBackup(
    project: ProjectMetadata,
    files: ProjectFile[],
    trigger: 'manual' | 'auto_interval' | 'on_close' = 'manual'
  ): NabBackupRecord {
    const { archiveJson } = ProjectArchiver.exportProject(project, files);
    const archive = JSON.parse(archiveJson) as NabProjectArchive;

    const backupRecord: NabBackupRecord = {
      id: `backup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      backupName: `${project.name} - ${new Date().toLocaleTimeString()} (${trigger})`,
      createdAt: new Date().toISOString(),
      trigger,
      projectId: project.id,
      projectName: project.name,
      archive,
      sizeBytes: archiveJson.length,
    };

    const currentBackups = this.getBackups();
    // Keep max 20 backups to conserve local storage
    const updatedBackups = [backupRecord, ...currentBackups].slice(0, 20);
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(updatedBackups));

    return backupRecord;
  }

  /**
   * Verifies backup integrity
   */
  public static verifyBackup(backup: NabBackupRecord): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (!backup.archive || !backup.archive.manifest) {
      issues.push('Missing archive manifest in backup record.');
    }

    if (!backup.archive.files || backup.archive.files.length === 0) {
      issues.push('Backup contains zero project files.');
    }

    if (!backup.archive.manifest?.project?.packageId) {
      issues.push('Missing required Android package ID in backup.');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Deletes a backup record
   */
  public static deleteBackup(backupId: string): void {
    const current = this.getBackups().filter((b) => b.id !== backupId);
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(current));
  }

  /**
   * Exports backup record as downloadable .nabbackup JSON string
   */
  public static serializeBackup(backup: NabBackupRecord): string {
    return JSON.stringify(backup, null, 2);
  }

  /**
   * Deserializes and verifies imported .nabbackup
   */
  public static deserializeBackup(backupJson: string): {
    isValid: boolean;
    backup?: NabBackupRecord;
    error?: string;
  } {
    try {
      const parsed = JSON.parse(backupJson);
      if (!parsed.id || !parsed.archive) {
        return {
          isValid: false,
          error: 'Unsupported backup format. File is not a valid .nabbackup archive.',
        };
      }
      return {
        isValid: true,
        backup: parsed as NabBackupRecord,
      };
    } catch (e: any) {
      return {
        isValid: false,
        error: `Corrupted .nabbackup file: ${e.message}`,
      };
    }
  }
}
