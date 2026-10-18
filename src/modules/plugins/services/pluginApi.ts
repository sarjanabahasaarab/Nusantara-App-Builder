/**
 * Nusantara App Builder - Plugin API Abstraction Layer
 * Phase 10: Safe, sandboxed API interface exposed to third-party plugins.
 * Never gives raw OS/Rust bindings directly to plugins.
 */

import { PluginInstance, PluginPermission } from '../types';
import { PluginSecurity } from './pluginSecurity';
import { ComponentRegistry, RegisteredVisualComponent } from '../../component-sdk/componentRegistry';
import { useProjectStore } from '../../../store/projectStore';
import { useUiStore } from '../../../store/uiStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { useBuildEngineStore } from '../../build-engine/store/buildEngineStore';
import { useReleaseCenterStore } from '../../release-center/store/releaseCenterStore';

export class PluginAPIContext {
  private plugin: PluginInstance;

  constructor(plugin: PluginInstance) {
    this.plugin = plugin;
  }

  private requirePermission(permission: PluginPermission): void {
    if (!PluginSecurity.hasPermission(this.plugin, permission)) {
      throw new Error(
        `Permission denied: Plugin "${this.plugin.manifest.name}" does not hold the required permission: "${permission}".`
      );
    }
  }

  public project = {
    getActiveProject: () => {
      this.requirePermission('project.read');
      return useProjectStore.getState().activeProject;
    },
    getFiles: () => {
      this.requirePermission('project.read');
      return useProjectStore.getState().files;
    },
    updateMetadata: (updates: Record<string, any>) => {
      this.requirePermission('project.write');
      useProjectStore.getState().updateProjectMetadata(updates);
    },
  };

  public designer = {
    registerComponent: (component: Omit<RegisteredVisualComponent, 'pluginId' | 'tier'>) => {
      this.requirePermission('project.write');
      return ComponentRegistry.register({
        ...component,
        pluginId: this.plugin.manifest.id,
        tier: 'plugin',
      });
    },
    listComponents: () => {
      return ComponentRegistry.getAll();
    },
  };

  public editor = {
    getActiveFile: () => {
      this.requirePermission('project.read');
      return useProjectStore.getState().activeFile;
    },
  };

  public build = {
    triggerDebugBuild: async () => {
      this.requirePermission('android.build');
      const active = useProjectStore.getState().activeProject;
      const files = useProjectStore.getState().files;
      if (!active) throw new Error('No active project to build.');
      return useBuildEngineStore.getState().startBuild(active, files, 'assembleDebug');
    },
  };

  public release = {
    getValidationReport: () => {
      this.requirePermission('project.read');
      return useReleaseCenterStore.getState().validationReport;
    },
  };

  public storage = {
    getItem: (key: string): string | null => {
      return localStorage.getItem(`nab_plugin_${this.plugin.manifest.id}_${key}`);
    },
    setItem: (key: string, value: string): void => {
      localStorage.setItem(`nab_plugin_${this.plugin.manifest.id}_${key}`, value);
    },
  };

  public ui = {
    showToast: (message: string) => {
      useUiStore.getState().showToast(`[${this.plugin.manifest.name}] ${message}`);
    },
  };

  public localization = {
    getLanguage: () => {
      return useSettingsStore.getState().settings.language.current || 'id';
    },
  };
}

export function createPluginAPI(plugin: PluginInstance): PluginAPIContext {
  return new PluginAPIContext(plugin);
}
