/**
 * Nusantara App Builder - Plugin Zustand Store
 * Phase 10: Reactive management for installed plugins, permissions, and security modals.
 */

import { create } from 'zustand';
import {
  PluginManifest,
  PluginInstance,
  PluginPermission,
  PermissionRequestState,
} from '../types';
import { PluginSecurity } from '../services/pluginSecurity';
import { ComponentRegistry } from '../../component-sdk/componentRegistry';

const DEFAULT_PLUGINS: PluginInstance[] = [
  {
    manifest: {
      id: 'nusantara.hello-card',
      name: 'Hello Component Card',
      version: '1.0.0',
      apiVersion: '1',
      author: 'Nusantara Ecosystem',
      description: 'Demonstrates custom visual component registration with interactive counter and gradient card.',
      category: 'component',
      permissions: ['project.read', 'project.write'],
      customComponentsCount: 1,
    },
    isEnabled: true,
    isBuiltin: true,
    installedAt: '2026-10-16T12:00:00.000Z',
    grantedPermissions: {
      'project.read': true,
      'project.write': true,
      'filesystem.read': false,
      'filesystem.write': false,
      'network.request': false,
      'process.execute': false,
      'android.build': false,
      'ui.modal': false,
    },
  },
  {
    manifest: {
      id: 'nusantara.payment-button',
      name: 'QRIS & Payment Button',
      version: '1.0.0',
      apiVersion: '1',
      author: 'IndoPay Developer Network',
      description: 'Quickly adds QRIS, Midtrans, and Xendit payment action buttons to Android layouts.',
      category: 'component',
      permissions: ['project.read', 'project.write', 'network.request'],
      customComponentsCount: 1,
    },
    isEnabled: true,
    isBuiltin: true,
    installedAt: '2026-10-16T12:00:00.000Z',
    grantedPermissions: {
      'project.read': true,
      'project.write': true,
      'filesystem.read': false,
      'filesystem.write': false,
      'network.request': true,
      'process.execute': false,
      'android.build': false,
      'ui.modal': false,
    },
  },
  {
    manifest: {
      id: 'nusantara.chart-view',
      name: 'Android MPAndroidChart Visualizer',
      version: '1.1.0',
      apiVersion: '1',
      author: 'Open Source Community',
      description: 'Visual interactive bar and line chart components for analytics and dashboard apps.',
      category: 'component',
      permissions: ['project.read', 'project.write'],
      customComponentsCount: 2,
    },
    isEnabled: false,
    isBuiltin: false,
    installedAt: '2026-10-16T12:00:00.000Z',
    grantedPermissions: {
      'project.read': false,
      'project.write': false,
      'filesystem.read': false,
      'filesystem.write': false,
      'network.request': false,
      'process.execute': false,
      'android.build': false,
      'ui.modal': false,
    },
  },
];

interface PluginState {
  plugins: PluginInstance[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  // Security Modal
  pendingPermissionRequest: PermissionRequestState | null;
  requestPermissions: (pluginId: string, permissions: PluginPermission[]) => Promise<boolean>;
  respondPermissionRequest: (granted: boolean) => void;

  // Plugin operations
  installPlugin: (manifest: PluginManifest, sourceCode?: string) => { success: boolean; error?: string };
  uninstallPlugin: (id: string) => void;
  togglePlugin: (id: string) => void;
  updatePermissions: (id: string, permissions: Record<PluginPermission, boolean>) => void;
}

export const usePluginStore = create<PluginState>((set, get) => ({
  plugins: DEFAULT_PLUGINS,
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectedCategory: 'all',
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  pendingPermissionRequest: null,

  requestPermissions: (pluginId, permissions) => {
    return new Promise((resolve) => {
      const plugin = get().plugins.find((p) => p.manifest.id === pluginId);
      if (!plugin) {
        resolve(false);
        return;
      }

      set({
        pendingPermissionRequest: {
          pluginId,
          pluginName: plugin.manifest.name,
          requestedPermissions: permissions,
          resolve,
        },
      });
    });
  },

  respondPermissionRequest: (granted) => {
    const request = get().pendingPermissionRequest;
    if (!request) return;

    if (granted) {
      set((state) => ({
        plugins: state.plugins.map((p) => {
          if (p.manifest.id !== request.pluginId) return p;
          const updatedGranted = { ...p.grantedPermissions };
          for (const perm of request.requestedPermissions) {
            updatedGranted[perm] = true;
          }
          return { ...p, grantedPermissions: updatedGranted };
        }),
      }));
    }

    request.resolve(granted);
    set({ pendingPermissionRequest: null });
  },

  installPlugin: (manifest, sourceCode) => {
    const validation = PluginSecurity.validateManifest(manifest);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    if (get().plugins.some((p) => p.manifest.id === manifest.id)) {
      return { success: false, error: `Plugin with ID "${manifest.id}" is already installed.` };
    }

    const defaultPerms = PluginSecurity.createDefaultPermissionMap(manifest.permissions || []);

    const newInstance: PluginInstance = {
      manifest,
      isEnabled: true,
      isBuiltin: false,
      installedAt: new Date().toISOString(),
      grantedPermissions: defaultPerms,
      sourceCode,
    };

    set((state) => ({ plugins: [newInstance, ...state.plugins] }));
    return { success: true };
  },

  uninstallPlugin: (id) => {
    ComponentRegistry.unregisterByPluginId(id);
    set((state) => ({ plugins: state.plugins.filter((p) => p.manifest.id !== id) }));
  },

  togglePlugin: (id) => {
    set((state) => ({
      plugins: state.plugins.map((p) => {
        if (p.manifest.id !== id) return p;
        const newStatus = !p.isEnabled;
        if (!newStatus) {
          ComponentRegistry.unregisterByPluginId(id);
        }
        return { ...p, isEnabled: newStatus };
      }),
    }));
  },

  updatePermissions: (id, permissions) => {
    set((state) => ({
      plugins: state.plugins.map((p) => {
        if (p.manifest.id !== id) return p;
        return { ...p, grantedPermissions: permissions };
      }),
    }));
  },
}));
