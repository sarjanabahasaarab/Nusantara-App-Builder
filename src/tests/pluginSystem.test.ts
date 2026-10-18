/**
 * Nusantara App Builder - Phase 10 Test Suite
 * Tests Plugin Security Sandbox, Component Registry, Project Import Service, and Theme Tokens.
 */

import { describe, it, expect } from 'vitest';
import { PluginSecurity } from '../modules/plugins/services/pluginSecurity';
import { ComponentRegistry } from '../modules/component-sdk/componentRegistry';
import { ProjectImportService } from '../modules/project-manager/projectImportService';
import { PluginInstance } from '../modules/plugins/types';

describe('Phase 10: Plugin Security Sandbox', () => {
  const mockPlugin: PluginInstance = {
    manifest: {
      id: 'test.plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      apiVersion: '1',
      author: 'Tester',
      description: 'Test plugin manifest',
      category: 'component',
      permissions: ['project.read'],
    },
    isEnabled: true,
    isBuiltin: false,
    installedAt: new Date().toISOString(),
    grantedPermissions: {
      'project.read': true,
      'project.write': false,
      'filesystem.read': false,
      'filesystem.write': false,
      'network.request': false,
      'process.execute': false,
      'android.build': false,
      'ui.modal': false,
    },
  };

  it('correctly grants explicitly enabled permissions', () => {
    expect(PluginSecurity.hasPermission(mockPlugin, 'project.read')).toBe(true);
  });

  it('strictly denies ungranted permissions by default', () => {
    expect(PluginSecurity.hasPermission(mockPlugin, 'process.execute')).toBe(false);
    expect(PluginSecurity.hasPermission(mockPlugin, 'filesystem.write')).toBe(false);
  });

  it('identifies critical risk permissions', () => {
    expect(PluginSecurity.isCriticalRisk('process.execute')).toBe(true);
    expect(PluginSecurity.isCriticalRisk('project.read')).toBe(false);
  });
});

describe('Phase 10: Component SDK & Registry', () => {
  it('loads standard basic and advanced components', () => {
    const all = ComponentRegistry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(8);

    const basic = ComponentRegistry.getByTier('basic');
    expect(basic.some((c) => c.type === 'text')).toBe(true);
    expect(basic.some((c) => c.type === 'button')).toBe(true);

    const advanced = ComponentRegistry.getByTier('advanced');
    expect(advanced.some((c) => c.type === 'webView')).toBe(true);
    expect(advanced.some((c) => c.type === 'admobBanner')).toBe(true);
  });

  it('allows plugin to register custom components', () => {
    const success = ComponentRegistry.register({
      type: 'testCustomWidget',
      name: 'Custom Test Widget',
      nameId: 'Widget Uji Kustom',
      description: 'Custom widget registered by test',
      descriptionId: 'Widget uji coba',
      tier: 'plugin',
      pluginId: 'test.plugin',
      iconName: 'Sparkles',
      defaultProperties: { foo: 'bar' },
      propertiesSchema: [],
      supportedEvents: ['onClick'],
      xmlTag: 'com.test.Widget',
    });

    expect(success).toBe(true);
    const comp = ComponentRegistry.get('testCustomWidget');
    expect(comp).toBeDefined();
    expect(comp?.xmlTag).toBe('com.test.Widget');
  });
});

describe('Phase 10: Project Import Service', () => {
  it('detects path traversal attempts as security violations', () => {
    const analysis = ProjectImportService.analyzeAndroidProject([
      { path: '../secret.txt', content: 'hack' },
      { path: 'app/src/main/AndroidManifest.xml', content: '<manifest></manifest>' },
    ]);
    expect(analysis.isValid).toBe(false);
    expect(analysis.errors.some((e) => e.includes('Security violation'))).toBe(true);
  });

  it('successfully analyzes valid AndroidManifest and Gradle files', () => {
    const manifest = `
      <manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.nusantara.demo">
        <application android:label="Nusantara Demo App">
          <activity android:name=".MainActivity" android:exported="true" />
        </application>
      </manifest>
    `;
    const gradle = `
      android {
        namespace = "com.nusantara.demo"
        compileSdk = 34
        defaultConfig {
          minSdk = 26
          targetSdk = 34
        }
      }
    `;

    const analysis = ProjectImportService.analyzeAndroidProject([
      { path: 'app/src/main/AndroidManifest.xml', content: manifest },
      { path: 'app/build.gradle.kts', content: gradle },
    ]);

    expect(analysis.isValid).toBe(true);
    expect(analysis.extractedMetadata?.appName).toBe('Nusantara Demo App');
    expect(analysis.extractedMetadata?.packageId).toBe('com.nusantara.demo');
    expect(analysis.extractedMetadata?.minSdk).toBe(26);
    expect(analysis.extractedMetadata?.targetSdk).toBe(34);
  });

  it('parses valid Nusantara project JSON backup', () => {
    const json = JSON.stringify({
      name: 'SampleRestored',
      packageId: 'com.sample.restored',
      versionName: '1.2.0',
      minSdk: 26,
      targetSdk: 34,
      template: 'blank-app',
    });

    const parsed = ProjectImportService.parseNusantaraProjectJson(json);
    expect(parsed.success).toBe(true);
    expect(parsed.metadata?.name).toBe('SampleRestored');
    expect(parsed.metadata?.versionName).toBe('1.2.0');
  });
});
