/**
 * Nusantara App Builder - Plugin Security Service
 * Phase 10: Strict permission auditing, manifest validation, and capability gatekeeper.
 */

import { PluginManifest, PluginPermission, PluginInstance } from '../types';

export interface PermissionMetadata {
  permission: PluginPermission;
  name: string;
  nameId: string;
  description: string;
  descriptionId: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
}

export const PERMISSION_METADATA: Record<PluginPermission, PermissionMetadata> = {
  'project.read': {
    permission: 'project.read',
    name: 'Read Project',
    nameId: 'Membaca Berkas Proyek',
    description: 'Allows plugin to inspect project metadata, layout structure, and source files.',
    descriptionId: 'Mengizinkan plugin membaca metadata proyek, tata letak, dan berkas sumber.',
    risk: 'low',
  },
  'project.write': {
    permission: 'project.write',
    name: 'Modify Project',
    nameId: 'Memodifikasi Proyek',
    description: 'Allows plugin to modify layout components, logic events, and project configuration.',
    descriptionId: 'Mengizinkan plugin mengubah komponen tata letak, logika alur, dan konfigurasi proyek.',
    risk: 'medium',
  },
  'filesystem.read': {
    permission: 'filesystem.read',
    name: 'Read Filesystem',
    nameId: 'Membaca Penyimpanan Lokal',
    description: 'Allows plugin to read assets or templates from the local filesystem.',
    descriptionId: 'Mengizinkan plugin membaca aset atau templat dari penyimpanan lokal.',
    risk: 'medium',
  },
  'filesystem.write': {
    permission: 'filesystem.write',
    name: 'Write Filesystem',
    nameId: 'Menulis Penyimpanan Lokal',
    description: 'Allows plugin to create or export files onto disk.',
    descriptionId: 'Mengizinkan plugin membuat atau mengekspor berkas ke disk.',
    risk: 'high',
  },
  'network.request': {
    permission: 'network.request',
    name: 'Network Access',
    nameId: 'Akses Jaringan & Internet',
    description: 'Allows plugin to fetch remote schemas, API definitions, or component assets.',
    descriptionId: 'Mengizinkan plugin mengambil skema eksternal, definisi API, atau aset komponen.',
    risk: 'medium',
  },
  'process.execute': {
    permission: 'process.execute',
    name: 'Execute External Process',
    nameId: 'Eksekusi Proses Eksternal',
    description: 'Allows plugin to execute external binaries or scripts on the operating system.',
    descriptionId: 'Mengizinkan plugin mengeksekusi biner eksternal atau skrip pada sistem operasi.',
    risk: 'critical',
  },
  'android.build': {
    permission: 'android.build',
    name: 'Trigger Android Build',
    nameId: 'Memicu Kompilasi Android',
    description: 'Allows plugin to invoke Gradle assemble and bundle release commands.',
    descriptionId: 'Mengizinkan plugin memanggil kompilasi Gradle assemble dan bundle rilis.',
    risk: 'medium',
  },
  'ui.modal': {
    permission: 'ui.modal',
    name: 'Display Custom UI Modal',
    nameId: 'Menampilkan Dialog Antarmuka',
    description: 'Allows plugin to display custom configuration modals and dialogs.',
    descriptionId: 'Mengizinkan plugin menampilkan jendela dialog konfigurasi kustom.',
    risk: 'low',
  },
};

export class PluginSecurity {
  /**
   * Validates plugin manifest structure and fields
   */
  public static validateManifest(manifest: Partial<PluginManifest>): {
    isValid: boolean;
    errors: string[];
    errorsId: string[];
  } {
    const errors: string[] = [];
    const errorsId: string[] = [];

    if (!manifest.id || !/^[a-z0-9-_.]+$/i.test(manifest.id)) {
      errors.push('Plugin ID is required and must only contain alphanumeric, dash, and dot characters.');
      errorsId.push('ID Plugin wajib diisi dan hanya boleh memuat huruf, angka, tanda minus, dan titik.');
    }

    if (!manifest.name || manifest.name.trim().length === 0) {
      errors.push('Plugin name is required.');
      errorsId.push('Nama plugin wajib diisi.');
    }

    if (!manifest.version || !/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/i.test(manifest.version)) {
      errors.push('Plugin version must follow semantic versioning (e.g. 1.0.0).');
      errorsId.push('Versi plugin harus mengikuti standar semantic versioning (contoh: 1.0.0).');
    }

    if (!manifest.apiVersion) {
      errors.push('Plugin apiVersion is required (e.g. "1").');
      errorsId.push('apiVersion plugin wajib diisi (contoh: "1").');
    }

    if (!manifest.author) {
      errors.push('Plugin author is required.');
      errorsId.push('Nama pembuat plugin wajib diisi.');
    }

    if (!manifest.category) {
      errors.push('Plugin category is required.');
      errorsId.push('Kategori plugin wajib diisi.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      errorsId,
    };
  }

  /**
   * Checks whether a plugin holds an approved permission
   */
  public static hasPermission(plugin: PluginInstance, permission: PluginPermission): boolean {
    if (!plugin.isEnabled) return false;
    return Boolean(plugin.grantedPermissions[permission]);
  }

  /**
   * Identifies whether a permission is critical risk
   */
  public static isCriticalRisk(permission: PluginPermission): boolean {
    return PERMISSION_METADATA[permission]?.risk === 'critical';
  }

  /**
   * Generates initial permissions map with default Deny
   */
  public static createDefaultPermissionMap(
    permissions: PluginPermission[]
  ): Record<PluginPermission, boolean> {
    const map = {} as Record<PluginPermission, boolean>;
    for (const p of permissions) {
      // Default security rule: DENY
      map[p] = false;
    }
    return map;
  }
}
