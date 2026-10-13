/**
 * Vitest Unit Tests: Native Bridge & Filesystem Operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NativeBridge } from '../modules/filesystem/nativeBridge';
import { CreateProjectInput } from '../types/project';

// Simple in-memory localStorage polyfill for test runner environment
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
  length: 0,
  key: () => null,
};

describe('Native Filesystem & Bridge Operations', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('creates project and registers it in index with real files', async () => {
    const input: CreateProjectInput = {
      name: 'BridgeTestApp',
      packageId: 'com.nusantara.bridge',
      location: 'C:\\Projects',
      description: 'Test Bridge',
      template: 'empty-android',
      interfaceLanguage: 'id',
    };

    const { project, files } = await NativeBridge.createProject(input);
    expect(project.name).toBe('BridgeTestApp');
    expect(files.length).toBeGreaterThan(0);

    const list = await NativeBridge.listProjects();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(project.id);
  });

  it('safely removes project record from history without deleting files', async () => {
    const input: CreateProjectInput = {
      name: 'SafeRemoveApp',
      packageId: 'com.nusantara.safe',
      location: 'C:\\Projects',
      description: '',
      template: 'empty-android',
      interfaceLanguage: 'en',
    };

    const { project } = await NativeBridge.createProject(input);
    expect((await NativeBridge.listProjects()).length).toBe(1);

    // Remove from recent list only
    await NativeBridge.removeRecentProject(project.id);
    expect((await NativeBridge.listProjects()).length).toBe(0);

    // Files should STILL be in storage! (Safe separation rule)
    const files = await NativeBridge.getProjectFiles(project.id);
    expect(files.length).toBeGreaterThan(0);
  });

  it('permanently deletes files only on deleteProjectPermanently', async () => {
    const input: CreateProjectInput = {
      name: 'PermanentDeleteApp',
      packageId: 'com.nusantara.perm',
      location: 'C:\\Projects',
      description: '',
      template: 'basic-activity',
      interfaceLanguage: 'id',
    };

    const { project } = await NativeBridge.createProject(input);
    await NativeBridge.deleteProjectPermanently(project.id);

    expect((await NativeBridge.listProjects()).length).toBe(0);
    const filesAfter = await NativeBridge.getProjectFiles(project.id);
    expect(filesAfter.length).toBe(0);
  });

  it('validates toolchain paths correctly during environment check', async () => {
    const res = await NativeBridge.checkEnvironment({
      androidSdkPath: 'C:\\Users\\User\\AppData\\Local\\Android\\Sdk',
      jdkPath: 'C:\\Program Files\\Java\\jdk-17',
      gradlePath: '',
    });

    expect(res.components.androidSdk.isAvailable).toBe(true);
    expect(res.components.jdk.isAvailable).toBe(true);
    expect(res.components.gradle.isAvailable).toBe(true);
    expect(res.overallReady).toBe(true);
  });
});
