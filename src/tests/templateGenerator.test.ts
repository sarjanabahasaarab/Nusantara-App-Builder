/**
 * Vitest Unit Tests: Android Template Generation
 */

import { describe, it, expect } from 'vitest';
import { generateProjectFiles, AVAILABLE_TEMPLATES } from '../modules/project-manager/templateGenerator';
import { CreateProjectInput } from '../types/project';

describe('Android Template Generator', () => {
  it('provides all 3 required templates', () => {
    expect(AVAILABLE_TEMPLATES).toHaveLength(3);
    const ids = AVAILABLE_TEMPLATES.map((t) => t.id);
    expect(ids).toContain('empty-android');
    expect(ids).toContain('basic-activity');
    expect(ids).toContain('webview-starter');
  });

  it('generates real Kotlin, Gradle, and Manifest files for Empty Android template', () => {
    const input: CreateProjectInput = {
      name: 'TestEmptyApp',
      packageId: 'com.nusantara.empty',
      location: 'C:\\Projects',
      description: 'Testing empty app',
      template: 'empty-android',
      interfaceLanguage: 'id',
    };

    const files = generateProjectFiles(input);
    expect(files.length).toBeGreaterThanOrEqual(14);

    const fileNames = files.map((f) => f.name);
    expect(fileNames).toContain('build.gradle.kts');
    expect(fileNames).toContain('settings.gradle.kts');
    expect(fileNames).toContain('gradle.properties');
    expect(fileNames).toContain('AndroidManifest.xml');
    expect(fileNames).toContain('MainActivity.kt');
    expect(fileNames).toContain('activity_main.xml');
    expect(fileNames).toContain('strings.xml');
    expect(fileNames).toContain('nusantara.project.json');

    // Check Kotlin file package declaration
    const mainKt = files.find((f) => f.name === 'MainActivity.kt')!;
    expect(mainKt.content).toContain('package com.nusantara.empty');
    expect(mainKt.content).toContain('class MainActivity : AppCompatActivity()');

    // Check AndroidManifest package/theme
    const manifest = files.find((f) => f.name === 'AndroidManifest.xml')!;
    expect(manifest.content).toContain('android:name=".MainActivity"');
  });

  it('generates Material 3 and FloatingActionButton for Basic Activity template', () => {
    const input: CreateProjectInput = {
      name: 'TestBasicApp',
      packageId: 'com.nusantara.basic',
      location: 'C:\\Projects',
      description: 'Testing basic app',
      template: 'basic-activity',
      interfaceLanguage: 'en',
    };

    const files = generateProjectFiles(input);
    const layout = files.find((f) => f.name === 'activity_main.xml')!;
    expect(layout.content).toContain('FloatingActionButton');
    expect(layout.content).toContain('MaterialToolbar');

    const mainKt = files.find((f) => f.name === 'MainActivity.kt')!;
    expect(mainKt.content).toContain('fabAction.setOnClickListener');
  });

  it('generates Internet permissions and WebChromeClient for WebView Starter template', () => {
    const input: CreateProjectInput = {
      name: 'TestWebviewApp',
      packageId: 'com.nusantara.webview',
      location: 'C:\\Projects',
      description: 'Testing webview app',
      template: 'webview-starter',
      interfaceLanguage: 'id',
    };

    const files = generateProjectFiles(input);
    const manifest = files.find((f) => f.name === 'AndroidManifest.xml')!;
    expect(manifest.content).toContain('android.permission.INTERNET');
    expect(manifest.content).toContain('android.permission.ACCESS_NETWORK_STATE');

    const mainKt = files.find((f) => f.name === 'MainActivity.kt')!;
    expect(mainKt.content).toContain('WebChromeClient');
    expect(mainKt.content).toContain('javaScriptEnabled = true');
  });
});
