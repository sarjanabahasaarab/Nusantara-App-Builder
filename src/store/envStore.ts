/**
 * Nusantara App Builder - Environment Store
 * Tracks real availability of Android SDK, ADB, Platforms, JDK, and Gradle.
 */

import { create } from 'zustand';
import { EnvironmentStatus } from '../types/settings';
import { NativeBridge } from '../modules/filesystem/nativeBridge';
import { useSettingsStore } from './settingsStore';

interface EnvState {
  status: EnvironmentStatus;
  isChecking: boolean;
  checkEnvironment: () => Promise<void>;
}

const initialStatus: EnvironmentStatus = {
  isChecking: false,
  lastChecked: null,
  overallReady: false,
  components: {
    androidSdk: {
      name: 'Android SDK Root (API 34)',
      category: 'sdk',
      configuredPath: '',
      status: 'missing',
      isAvailable: false,
      statusText: 'Belum dipindai',
      statusTextId: 'Belum dipindai',
    },
    adb: {
      name: 'Android Debug Bridge (ADB)',
      category: 'adb',
      configuredPath: '',
      status: 'missing',
      isAvailable: false,
      statusText: 'Belum dipindai',
      statusTextId: 'Belum dipindai',
    },
    sdkPlatform: {
      name: 'SDK Platform android-34',
      category: 'platform',
      configuredPath: '',
      status: 'missing',
      isAvailable: false,
      statusText: 'Belum dipindai',
      statusTextId: 'Belum dipindai',
    },
    jdk: {
      name: 'Java Development Kit (JDK 17 LTS)',
      category: 'jdk',
      configuredPath: '',
      status: 'missing',
      isAvailable: false,
      statusText: 'Belum dipindai',
      statusTextId: 'Belum dipindai',
    },
    gradle: {
      name: 'Gradle Wrapper 8.7',
      category: 'gradle',
      configuredPath: 'Embedded Gradle Wrapper 8.7',
      status: 'installed',
      isAvailable: true,
      statusText: 'Gradle Wrapper 8.7 tersemat.',
      statusTextId: 'Gradle Wrapper 8.7 tersemat.',
    },
    directoryAccess: {
      name: 'Filesystem Permissions',
      category: 'permissions',
      configuredPath: 'Project target folder',
      status: 'installed',
      isAvailable: true,
      statusText: 'Izin direktori siap.',
      statusTextId: 'Izin direktori siap.',
    },
  },
};

export const useEnvStore = create<EnvState>((set) => ({
  status: initialStatus,
  isChecking: false,

  checkEnvironment: async () => {
    set({ isChecking: true });
    const toolchain = useSettingsStore.getState().settings.toolchain;

    try {
      const res = await NativeBridge.checkEnvironment({
        androidSdkPath: toolchain.androidSdkPath,
        jdkPath: toolchain.jdkPath,
        gradlePath: toolchain.gradlePath,
      });
      set({ status: res, isChecking: false });
    } catch {
      set({ isChecking: false });
    }
  },
}));
