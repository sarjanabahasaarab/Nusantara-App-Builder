/**
 * Vitest Unit Tests: Settings & Preferences Store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../store/settingsStore';

describe('Settings & Preferences Store', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetToDefaults();
  });

  it('toggles theme between dark, light, and system', () => {
    const store = useSettingsStore.getState();
    expect(store.settings.appearance.theme).toBe('dark');

    store.setTheme('light');
    expect(useSettingsStore.getState().settings.appearance.theme).toBe('light');

    store.setTheme('system');
    expect(useSettingsStore.getState().settings.appearance.theme).toBe('system');
  });

  it('switches interface language between Indonesian (id) and English (en)', () => {
    const store = useSettingsStore.getState();
    expect(store.settings.language.current).toBe('id');

    store.setLanguage('en');
    expect(useSettingsStore.getState().settings.language.current).toBe('en');

    store.setLanguage('id');
    expect(useSettingsStore.getState().settings.language.current).toBe('id');
  });

  it('updates toolchain path settings', () => {
    const store = useSettingsStore.getState();
    const newSdkPath = 'D:\\Android\\Sdk';
    store.updateToolchainSettings({ androidSdkPath: newSdkPath });

    expect(useSettingsStore.getState().settings.toolchain.androidSdkPath).toBe(newSdkPath);
  });

  it('updates general settings', () => {
    const store = useSettingsStore.getState();
    store.updateGeneralSettings({ autoSaveIntervalSeconds: 60, telemetryEnabled: false });

    expect(useSettingsStore.getState().settings.general.autoSaveIntervalSeconds).toBe(60);
    expect(useSettingsStore.getState().settings.general.telemetryEnabled).toBe(false);
  });
});
