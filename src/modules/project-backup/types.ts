/**
 * Nusantara App Builder - Project Archive (.nabproject) and Backup (.nabbackup) Types
 * Phase 10: Strict exclusion of keystores/passwords/secrets; safe structure verification.
 */

import { ProjectMetadata, ProjectFile } from '../../types/project';

export interface NabProjectManifest {
  format: 'nabproject';
  version: '1.0.0';
  generator: 'Nusantara App Builder';
  exportedAt: string;
  project: ProjectMetadata;
  filesSummary: {
    totalFiles: number;
    totalSizeBytes: number;
    categories: string[];
  };
  checksum: string;
}

export interface NabProjectArchive {
  manifest: NabProjectManifest;
  files: ProjectFile[];
}

export interface NabBackupRecord {
  id: string;
  backupName: string;
  createdAt: string;
  trigger: 'manual' | 'auto_interval' | 'on_close';
  projectId: string;
  projectName: string;
  archive: NabProjectArchive;
  sizeBytes: number;
}

export type AutoBackupInterval = 'off' | '10min' | '30min' | 'on_close';
