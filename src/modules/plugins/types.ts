/**
 * Nusantara App Builder - Plugin System & Security Types
 * Phase 10: Extensible, secure plugin architecture with strict permission controls.
 */

export type PluginPermission =
  | 'project.read'
  | 'project.write'
  | 'filesystem.read'
  | 'filesystem.write'
  | 'network.request'
  | 'process.execute'
  | 'android.build'
  | 'ui.modal';

export type PluginCategory =
  | 'component'
  | 'template'
  | 'generator'
  | 'database'
  | 'api'
  | 'theme'
  | 'build-extension'
  | 'export-format';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  apiVersion: string; // e.g. "1"
  author: string;
  description: string;
  category: PluginCategory;
  homepage?: string;
  repository?: string;
  license?: string;
  permissions: PluginPermission[];
  entryPoint?: string;
  customComponentsCount?: number;
}

export type PermissionGrantStatus = 'granted' | 'denied' | 'pending';

export interface PluginInstance {
  manifest: PluginManifest;
  isEnabled: boolean;
  isBuiltin: boolean;
  installedAt: string;
  grantedPermissions: Record<PluginPermission, boolean>;
  sourceCode?: string;
  error?: string;
}

export interface PermissionRequestState {
  pluginId: string;
  pluginName: string;
  requestedPermissions: PluginPermission[];
  resolve: (granted: boolean) => void;
}
